import React, { useState } from 'react';

interface JoinRoomProps {
  onJoinRoom: (roomId: string, password: string, playerName: string) => void;
  error: string;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ onJoinRoom, error }) => {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && password.trim() && playerName.trim()) {
      onJoinRoom(roomId.trim(), password.trim(), playerName.trim());
    }
  };

  return (
    <div className="join-room">
      <h1>五目並べ オンライン</h1>
      <form onSubmit={handleSubmit} className="join-form">
        <div className="form-group">
          <label htmlFor="playerName">プレイヤー名:</label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="あなたの名前を入力"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="roomId">ルーム名:</label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ルーム名を入力"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">合言葉:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="合言葉を入力"
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="join-button">
          ルームに参加
        </button>
      </form>
      
      <div className="instructions">
        <h3>遊び方:</h3>
        <ul>
          <li>ルーム名と合言葉を入力してルームに参加</li>
          <li>2人のプレイヤーが揃ったら「準備完了」を押す</li>
          <li>先手は黒、後手は白で交互に石を置く</li>
          <li>縦・横・斜めのいずれかで5つ並べれば勝利</li>
        </ul>
      </div>
    </div>
  );
};

export default JoinRoom;