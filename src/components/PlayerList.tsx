import React from 'react';

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

interface PlayerListProps {
  players: { [socketId: string]: Player };
  myPlayerNumber: number | null;
  onPlayerReady: () => void;
  gameState: GameState;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, myPlayerNumber, onPlayerReady, gameState }) => {
  const playerIds = Object.keys(players);
  const isMyReady = myPlayerNumber ? players[Object.keys(players)[myPlayerNumber - 1]]?.isReady : false;

  return (
    <div className="player-list">
      <h3>プレイヤー ({playerIds.length}/2)</h3>
      
      {playerIds.map((socketId, index) => (
        <div key={socketId} className={`player-item ${index + 1 === myPlayerNumber ? 'my-player' : ''}`}>
          <div className="player-info">
            <span className="player-name">{players[socketId].name}</span>
            <span className="player-color">
              {index === 0 ? '(黒)' : '(白)'}
            </span>
          </div>
          <div className="player-status">
            {players[socketId].isReady ? (
              <span className="ready-status ready">準備完了</span>
            ) : (
              <span className="ready-status not-ready">待機中</span>
            )}
          </div>
        </div>
      ))}
      
      {playerIds.length < 2 && (
        <div className="waiting-message">
          <p>もう1人のプレイヤーを待っています...</p>
        </div>
      )}
      
      {playerIds.length === 2 && !gameState.isGameStarted && (
        <div className="ready-section">
          {!isMyReady && (
            <button onClick={onPlayerReady} className="ready-button">
              準備完了
            </button>
          )}
          {isMyReady && (
            <p className="waiting-message">相手の準備完了を待っています...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerList;