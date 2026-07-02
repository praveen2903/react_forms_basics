require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./db.cjs');

const app = express();
app.use(cors());
app.use(express.json()); // Essential for parsing JSON body

// ─── Rate Limiting ──────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window`
  message: { error: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Middleware ─────────────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ─── Auth Routes ────────────────────────────────────────────────────────────────
let refreshTokens = []; // In-memory store for simplicity, ideally should be in DB or Redis

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_REFRESH_SECRET);
    
    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const { token } = req.body;
  if (token == null) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ userId: user.userId, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  });
});

app.post('/api/auth/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);
  res.sendStatus(204);
});

// ─── Data Routes ────────────────────────────────────────────────────────────────
app.get('/locations', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM locations ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const bookingsResult = await db.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY id DESC', [req.user.userId]);
    
    const bookings = await Promise.all(bookingsResult.rows.map(async (booking) => {
      const passengersResult = await db.query('SELECT * FROM passengers WHERE booking_id = $1', [booking.id]);
      
      return {
        id: booking.id,
        locationName: booking.location_name,
        name: booking.name,
        email: booking.email,
        phoneNumber: booking.phone_number,
        visitDate: booking.visit_date,
        packageType: booking.package_type,
        noOfPeople: booking.no_of_people,
        passengerDetails: passengersResult.rows.map(p => ({
          passengerName: p.passenger_name,
          gender: p.gender,
          age: p.age,
          preferences: p.preferences || []
        }))
      };
    }));

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { locationName, name, email, phoneNumber, visitDate, packageType, noOfPeople, passengerDetails } = req.body;
    
    // Add validation (simple)
    if(!locationName || !name || !email || !visitDate || !packageType || !noOfPeople) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Explicitly parse visitDate if needed to handle ISO strings properly, though pg might handle it.
    
    const bookingResult = await db.query(
      `INSERT INTO bookings 
      (user_id, location_name, name, email, phone_number, visit_date, package_type, no_of_people) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [req.user.userId, locationName, name, email, phoneNumber, visitDate, packageType, noOfPeople]
    );
    
    const bookingId = bookingResult.rows[0].id;
    
    for (const p of passengerDetails) {
      await db.query(
        `INSERT INTO passengers (booking_id, passenger_name, gender, age, preferences) 
         VALUES ($1, $2, $3, $4, $5)`,
        [bookingId, p.passengerName, p.gender, p.age, JSON.stringify(p.preferences || [])]
      );
    }
    
    res.status(201).json({ id: bookingId, message: 'Booking created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const bookingResult = await db.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    const passengersResult = await db.query('SELECT * FROM passengers WHERE booking_id = $1', [booking.id]);
    
    const responseData = {
      id: booking.id,
      locationName: booking.location_name,
      name: booking.name,
      email: booking.email,
      phoneNumber: booking.phone_number,
      visitDate: booking.visit_date.toISOString().split('T')[0], // format date for input field
      packageType: booking.package_type,
      noOfPeople: booking.no_of_people,
      passengerDetails: passengersResult.rows.map(p => ({
        passengerName: p.passenger_name,
        gender: p.gender,
        age: p.age,
        preferences: p.preferences || []
      }))
    };
    
    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { locationName, name, email, phoneNumber, visitDate, packageType, noOfPeople, passengerDetails } = req.body;
    
    // Check ownership
    const checkResult = await db.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await db.query(
      `UPDATE bookings SET 
       location_name = $1, name = $2, email = $3, phone_number = $4, visit_date = $5, package_type = $6, no_of_people = $7 
       WHERE id = $8 AND user_id = $9`,
      [locationName, name, email, phoneNumber, visitDate, packageType, noOfPeople, req.params.id, req.user.userId]
    );
    
    // Simple approach: delete existing passengers and insert new ones
    await db.query('DELETE FROM passengers WHERE booking_id = $1', [req.params.id]);
    
    for (const p of passengerDetails) {
      await db.query(
        `INSERT INTO passengers (booking_id, passenger_name, gender, age, preferences) 
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, p.passengerName, p.gender, p.age, JSON.stringify(p.preferences || [])]
      );
    }
    
    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM bookings WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Socket.IO event handling ───────────────────────────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

const MAX_HISTORY = 50;
const roomMessages = {};   
const roomUsers    = {};   

function getRoomUserList(room) {
  if (!roomUsers[room]) return [];
  return [...roomUsers[room]].map(u => u.username);
}

function addMessage(room, msg) {
  if (!roomMessages[room]) roomMessages[room] = [];
  roomMessages[room].push(msg);
  if (roomMessages[room].length > MAX_HISTORY) {
    roomMessages[room] = roomMessages[room].slice(-MAX_HISTORY);
  }
}

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  let currentRoom = null;
  let currentUser = null;

  socket.on('join_room', ({ room, username }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      if (roomUsers[currentRoom]) {
        roomUsers[currentRoom] = new Set(
          [...roomUsers[currentRoom]].filter(u => u.socketId !== socket.id)
        );
      }
      io.to(currentRoom).emit('user_left', {
        username: currentUser,
        users: getRoomUserList(currentRoom),
      });
    }

    currentRoom = room;
    currentUser = username;
    socket.join(room);

    if (!roomUsers[room]) roomUsers[room] = new Set();
    roomUsers[room].add({ socketId: socket.id, username });

    socket.emit('message_history', roomMessages[room] || []);

    io.to(room).emit('user_joined', {
      username,
      users: getRoomUserList(room),
    });
  });

  socket.on('send_message', ({ room, username, text }) => {
    const message = {
      id: `${socket.id}-${Date.now()}`,
      user: username,
      text,
      timestamp: new Date().toISOString(),
    };
    addMessage(room, message);
    io.to(room).emit('receive_message', message);
  });

  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('user_typing', { username });
  });

  socket.on('stop_typing', ({ room, username }) => {
    socket.to(room).emit('user_stop_typing', { username });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    if (currentRoom && roomUsers[currentRoom]) {
      roomUsers[currentRoom] = new Set(
        [...roomUsers[currentRoom]].filter(u => u.socketId !== socket.id)
      );
      io.to(currentRoom).emit('user_left', {
        username: currentUser,
        users: getRoomUserList(currentRoom),
      });
    }
  });
});

// ─── Health check route ─────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Travels App Chat Server is running 🚀' });
});

// ─── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
});
