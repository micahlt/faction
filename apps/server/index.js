const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const registerSocketHandlers = require('./src/sockets');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" } // In prod, change to host domain
});

connectDB();

// Middlewares go here
app.use(express.json());

// Register REST endpoints here
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/messages', require('./src/routes/messages'));

registerSocketHandlers(io);

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Faction Server is running on http://localhost:${PORT}`);
});