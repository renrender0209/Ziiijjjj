import React from 'react';

interface GameBoardProps {
  board: number[][];
  onCellClick: (row: number, col: number) => void;
  isMyTurn: boolean;
  isGameStarted: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, isMyTurn, isGameStarted }) => {
  const handleCellClick = (row: number, col: number) => {
    if (isGameStarted && isMyTurn && board[row][col] === 0) {
      onCellClick(row, col);
    }
  };

  return (
    <div className="game-board">
      <div className="board-container">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`board-cell ${cell === 1 ? 'black' : cell === 2 ? 'white' : ''} ${
                  isMyTurn && isGameStarted && cell === 0 ? 'clickable' : ''
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell === 1 && <div className="stone black-stone"></div>}
                {cell === 2 && <div className="stone white-stone"></div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;