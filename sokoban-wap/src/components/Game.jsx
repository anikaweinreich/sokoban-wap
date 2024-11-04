import React, { useState } from 'react';
import ExtractLevels from './ExtractLevels';

const Game = () => {
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const goToNextLevel = () => {
    // Increment the level index
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    }
  };

  return (
    <div>
      <h1>Sokoban Game</h1>
      <ExtractLevels setLevels={setLevels} />
      {levels.length > 0 && (
        <div>
          <h2>Level: {levels[currentLevelIndex].title}</h2>
          <pre>{levels[currentLevelIndex].design.join('\n')}</pre>
          {/* Button to go to the next level (for testing) */}
          <button onClick={goToNextLevel}>Next Level</button>
        </div>
      )}
    </div>
  );
};

export default Game;
