import React, { useState } from 'react';
import ExtractLevels from './ExtractLevels';
import GameLogic from "./GameLogic.jsx";

const Game = () => {
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const goToNextLevel = () => {
    // Increment the level index
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setResetKey(resetKey + 1); // Muss gesetzt werden, um den Highscore zurückzusetzen
    }
  };

  const goToPreviousLevel = () => {
    // Decrement the level index
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
      setResetKey(resetKey + 1); // Muss gesetzt werden, um den Highscore zurückzusetzen
    }
  };

  const resetLevel = () => {
    setResetKey(resetKey + 1);
  };

  return (
    <div>
      <h1>Sokoban Game</h1>
      <ExtractLevels setLevels={setLevels} />
      {levels.length > 0 && (
        <div>
          <h2>Level: {levels[currentLevelIndex].title}</h2>
          <GameLogic
              key={resetKey} // key Parameter wird verwendet, um das Level bei Änderung des resetKey's neu zu rendern
              levels={levels}
              currentLevelIndex={currentLevelIndex}
              onLevelComplete={goToNextLevel} // Übergebung der Callback-Funktion "goToNextLevel"
          />
          <button onClick={goToPreviousLevel}>Previous Level</button>
          <button onClick={resetLevel}>Reset Level</button>
          {/* Button to go to the next level (for testing) */}
          <button onClick={goToNextLevel}>Next Level</button>
        </div>
      )}
    </div>
  );
};

export default Game;
