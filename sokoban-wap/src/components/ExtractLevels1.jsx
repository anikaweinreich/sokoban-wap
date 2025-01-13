import React, { useEffect, useState } from 'react';

const LevelParser = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch('/levels.txt');  // Fetch file from public folder
        if (!response.ok) throw new Error('Failed to load level.txt');
        
        const text = await response.text();
        parseLevels(text);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const parseLevels = (text) => {
      const levels = [];
      const lines = text.split('\n');

      let currentLevel = { design: [], title: ''};
      let isParsingDesign = false;
  
      for (let line of lines) {
          if (line.trim() === '') {
              // If the line is empty, the current level design parsing is done
              if (isParsingDesign && currentLevel.title) {
                  // If we were parsing a design and have a title, we finished the current level
                  levels.push(currentLevel);
                  currentLevel = { design: [], title: '' }; // Reset for the next level
              }
              isParsingDesign = false;
              continue; // go to next line
          }
  
          if (['-', '#', '$', '@'].some(char => line.startsWith(char))) {
              // If the line starts with a design character
              currentLevel.design.push(line); // Add design lines to the current level
              isParsingDesign = true; // We are now in the design section
          }
          else if (line.startsWith('Title: ')) {
              // If we were parsing a design, add the title
            if (isParsingDesign) {
                currentLevel.title = line.replace('Title: ', '').trim();
            }
            
          }
         
      }
      // Final check to add the last level
      if (currentLevel.design.length > 0) {
          levels.push(currentLevel);
      }
    };

    fetchFile();
  }, []);

  if (loading) return <p>Loading levels...</p>;
  if (error) return <p>Error: {error}</p>;

  return null;
};

export default LevelParser;
