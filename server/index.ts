const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Game state management
interface GameRoom {
  id: string;
  password: string;
  players: { [socketId: string]: { name: string; isReady: boolean } };
  gameState: {
    board: number[][];
    currentPlayer: number;
    isGameStarted: boolean;
    winner: number | null;
  };
  playerCount: number;
}

const rooms: Map<string, GameRoom> = new Map();

// Create empty board
const createEmptyBoard = (): number[][] => {
  return Array(15).fill(null).map(() => Array(15).fill(0));
};

// Check for win condition
const checkWin = (board: number[][], row: number, col: number, player: number): boolean => {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    
    // Check positive direction
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && board[newRow][newCol] === player) {
        count++;
      } else {
        break;
      }
    }
    
    // Check negative direction
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && board[newRow][newCol] === player) {
        count++;
      } else {
        break;
      }
    }
    
    if (count >= 5) return true;
  }
  
  return false;
};

io.on('connection', (socket: any) => {
  console.log('Player connected:', socket.id);

  // Join room with password
  socket.on('join-room', (data: { roomId: string; password: string; playerName: string }) => {
    const { roomId, password, playerName } = data;
    
    if (!rooms.has(roomId)) {
      // Create new room
      const newRoom: GameRoom = {
        id: roomId,
        password,
        players: {},
        gameState: {
          board: createEmptyBoard(),
          currentPlayer: 1,
          isGameStarted: false,
          winner: null
        },
        playerCount: 0
      };
      rooms.set(roomId, newRoom);
    }

    const room = rooms.get(roomId)!;
    
    // Check password
    if (room.password !== password) {
      socket.emit('join-error', 'パスワードが間違っています');
      return;
    }

    // Check if room is full
    if (room.playerCount >= 2) {
      socket.emit('join-error', 'ルームが満員です');
      return;
    }

    // Add player to room
    room.players[socket.id] = { name: playerName, isReady: false };
    room.playerCount++;
    socket.join(roomId);

    // Notify all players in room
    io.to(roomId).emit('room-update', {
      players: room.players,
      gameState: room.gameState
    });

    console.log(`Player ${playerName} joined room ${roomId}`);
  });

  // Player ready
  socket.on('player-ready', () => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId as string);
    if (!room || !room.players[socket.id]) return;

    room.players[socket.id].isReady = true;

    // Check if both players are ready
    const playerIds = Object.keys(room.players);
    if (playerIds.length === 2 && playerIds.every(id => room.players[id].isReady)) {
      // Start game
      room.gameState.isGameStarted = true;
      room.gameState.board = createEmptyBoard();
      room.gameState.currentPlayer = 1;
      room.gameState.winner = null;

      io.to(roomId).emit('game-start', {
        players: room.players,
        gameState: room.gameState
      });
    } else {
      io.to(roomId).emit('room-update', {
        players: room.players,
        gameState: room.gameState
      });
    }
  });

  // Make move
  socket.on('make-move', (data: { row: number; col: number }) => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId as string);
    if (!room || !room.gameState.isGameStarted) return;

    const { row, col } = data;
    const playerIds = Object.keys(room.players);
    const currentPlayerIndex = playerIds.indexOf(socket.id);
    
    // Check if it's player's turn
    if (currentPlayerIndex + 1 !== room.gameState.currentPlayer) return;

    // Check if cell is empty
    if (room.gameState.board[row][col] !== 0) return;

    // Make move
    room.gameState.board[row][col] = room.gameState.currentPlayer;

    // Check for win
    if (checkWin(room.gameState.board, row, col, room.gameState.currentPlayer)) {
      room.gameState.winner = room.gameState.currentPlayer;
      io.to(roomId).emit('game-end', {
        winner: room.gameState.winner,
        gameState: room.gameState
      });
    } else {
      // Switch player
      room.gameState.currentPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;
      io.to(roomId).emit('game-update', {
        gameState: room.gameState
      });
    }
  });

  // Reset game
  socket.on('reset-game', () => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId as string);
    if (!room) return;

    room.gameState = {
      board: createEmptyBoard(),
      currentPlayer: 1,
      isGameStarted: false,
      winner: null
    };

    // Reset ready status
    Object.keys(room.players).forEach(id => {
      room.players[id].isReady = false;
    });

    io.to(roomId).emit('room-update', {
      players: room.players,
      gameState: room.gameState
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    // Remove player from all rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        room.playerCount--;
        
        if (room.playerCount === 0) {
          // Remove empty room
          rooms.delete(roomId);
        } else {
          // Notify remaining players
          io.to(roomId).emit('room-update', {
            players: room.players,
            gameState: room.gameState
          });
        }
        break;
      }
    }
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_: any, res: any) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});