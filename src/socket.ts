import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

const socket = io(SOCKET_URL, {
  autoConnect: false,        // connect manually when chat opens
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
