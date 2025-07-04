import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import JoinRoom from './components/JoinRoom';
import GameBoard from './components/GameBoard';
import PlayerList from './components/PlayerList';
import './App.css';

interface Player {
  name: string;
  isReady: boolean;
}

interface GameState {
  board: number[][];
  currentPlayer: number;
  isGameStarted: boolean;
  winner: number | null;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<{ [socketId: string]: Player }>({});
  const [gameState, setGameState] = useState<GameState>({
    board: Array(15).fill(null).map(() => Array(15).fill(0)),
    currentPlayer: 1,
    isGameStarted: false,
    winner: null
  });
  const [error, setError] = useState<string>('');
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError('');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('join-error', (message: string) => {
      setError(message);
    });

    newSocket.on('room-update', (data: { players: { [socketId: string]: Player }, gameState: GameState }) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setError('');
      
      // Determine player number
      const playerIds = Object.keys(data.players);
      const socketId = newSocket.id;
      if (socketId) {
        const myIndex = playerIds.indexOf(socketId);
        if (myIndex !== -1) {
          setMyPlayerNumber(myIndex + 1);
        }
      }
    });

    newSocket.on('game-start', (data: { players: { [socketId: string]: Player }, gameState: GameState }) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setError('');
    });

    newSocket.on('game-update', (data: { gameState: GameState }) => {
      setGameState(data.gameState);
    });

    newSocket.on('game-end', (data: { winner: number, gameState: GameState }) => {
      setGameState(data.gameState);
      
      if (data.winner === myPlayerNumber) {
        alert('勝利！おめでとうございます！');
      } else {
        alert('負けました。もう一度挑戦してみてください。');
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string, password: string, playerName: string) => {
    if (socket && isConnected) {
      setRoomId(roomId);
      setPlayerName(playerName);
      socket.emit('join-room', { roomId, password, playerName });
    }
  };

  const playerReady = () => {
    if (socket) {
      socket.emit('player-ready');
    }
  };

  const makeMove = (row: number, col: number) => {
    if (socket && gameState.isGameStarted && gameState.currentPlayer === myPlayerNumber) {
      socket.emit('make-move', { row, col });
    }
  };

  const resetGame = () => {
    if (socket) {
      socket.emit('reset-game');
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
      setRoomId('');
      setPlayerName('');
      setPlayers({});
      setGameState({
        board: Array(15).fill(null).map(() => Array(15).fill(0)),
        currentPlayer: 1,
        isGameStarted: false,
        winner: null
      });
      setMyPlayerNumber(null);
      setError('');
    }
  };

  if (!isConnected) {
    return (
      <div className="app">
        <div className="connection-status">
          <h2>サーバーに接続中...</h2>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="app">
        <JoinRoom onJoinRoom={joinRoom} error={error} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>五目並べ オンライン</h1>
        <div className="room-info">
          <span>ルーム: {roomId}</span>
          <span>プレイヤー: {playerName}</span>
          <button onClick={leaveRoom} className="leave-button">退出</button>
        </div>
      </header>
      
      <div className="game-container">
        <div className="game-left">
          <PlayerList 
            players={players}
            myPlayerNumber={myPlayerNumber}
            onPlayerReady={playerReady}
            gameState={gameState}
          />
          
          {gameState.isGameStarted && (
            <div className="game-status">
              <h3>
                {gameState.currentPlayer === myPlayerNumber ? 'あなたの番です' : '相手の番です'}
              </h3>
              <div className="current-player">
                現在のプレイヤー: {gameState.currentPlayer === 1 ? '黒' : '白'}
              </div>
            </div>
          )}
          
          {gameState.winner && (
            <div className="game-result">
              <h3>
                {gameState.winner === myPlayerNumber ? '勝利！' : '敗北'}
              </h3>
              <button onClick={resetGame} className="reset-button">
                もう一度プレイ
              </button>
            </div>
          )}
        </div>
        
        <div className="game-right">
          <GameBoard 
            board={gameState.board}
            onCellClick={makeMove}
            isMyTurn={gameState.currentPlayer === myPlayerNumber}
            isGameStarted={gameState.isGameStarted}
          />
        </div>
      </div>
    </div>
  );
};

export default App;