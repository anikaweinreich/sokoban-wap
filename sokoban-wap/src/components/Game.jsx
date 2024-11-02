import React, { useState } from 'react';
import ExtractLevels from './ExtractLevels2';

const Game = () => {
  const [levels, setLevels] = useState([]);

  return (
    <div>
      <h1>Sokoban Game</h1>
      <ExtractLevels setLevels={setLevels} />
      {levels.length > 0 && (
        <div>
          <h2>Title: {levels[1].title}</h2>
          <pre>{levels[1].design.join('\n')}</pre>
        </div>
      )}
    </div>
  );
};

export default Game;
