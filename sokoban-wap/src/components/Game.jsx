import React, { useState } from 'react';
import ExtractLevels from './ExtractLevels';
import GameLogic from "./GameLogic.jsx";

import { Box, Button, Typography, Paper } from '@mui/material';

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
    <Box sx={{ padding: 3, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#264A8A', marginBottom: 2 }}>
        Sokoban Game
      </Typography>
  
      {/* Levels */}
      <ExtractLevels setLevels={setLevels} />
  
      {levels.length > 0 && (
        <Paper sx={{ padding: 3, boxShadow: 2, borderRadius: 4, marginTop: 3 }}>
          <Typography variant="h4" sx={{ marginBottom: 2 }}>
            Level: {levels[currentLevelIndex].title}
          </Typography>
  
          <GameLogic
            key={resetKey}
            levels={levels}
            currentLevelIndex={currentLevelIndex}
            onLevelComplete={goToNextLevel}
          />
  
          {/* Level Control Buttons */}
          <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={goToPreviousLevel} 
              sx={{ padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold',':focus': {outline: 'none'} }}
            >
              Previous Level
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={resetLevel} 
              sx={{ padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold',':focus': {outline: 'none'} }}
            >
              Reset Level
            </Button>
  
            <Button 
              variant="outlined" 
              onClick={goToNextLevel} 
              sx={{ padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', ':focus': {outline: 'none'} }}
            >
              Next Level
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Game;
