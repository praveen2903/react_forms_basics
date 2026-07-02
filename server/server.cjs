const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

// ─── In-memory store ───────────────────────────────────────────────────────────
const MAX_HISTORY = 50;
const roomMessages = {};   // { roomName: [{ id, user, text, timestamp }] }
const roomUsers    = {};   // { roomName: Set<{ socketId, username }> }

// ─── Helpers ────────────────────────────────────────────────────────────────────
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

// ─── Socket.IO event handling ───────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  let currentRoom = null;
  let currentUser = null;

  // ── Join a chat room ──────────────────────────────────────────────────────────
  socket.on('join_room', ({ room, username }) => {
    // Leave previous room if any
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

    // Track user in room
    if (!roomUsers[room]) roomUsers[room] = new Set();
    roomUsers[room].add({ socketId: socket.id, username });

    // Send message history to the joining user
    socket.emit('message_history', roomMessages[room] || []);

    // Broadcast that user joined
    io.to(room).emit('user_joined', {
      username,
      users: getRoomUserList(room),
    });

    console.log(`👤 ${username} joined room: ${room}`);
  });

  // ── Send a message ────────────────────────────────────────────────────────────
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

  // ── Typing indicator ─────────────────────────────────────────────────────────
  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('user_typing', { username });
  });

  socket.on('stop_typing', ({ room, username }) => {
    socket.to(room).emit('user_stop_typing', { username });
  });

  // ── Disconnect ────────────────────────────────────────────────────────────────
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
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Chat server running on http://localhost:${PORT}\n`);
});
