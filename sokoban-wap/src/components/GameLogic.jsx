import React, { useState, useEffect } from 'react';
import boxOnFloorImg from '../assets/flat/boxOnFloor.png';
import boxOnTargetImg from '../assets/flat/boxOnTarget.png';
import floorImg from '../assets/flat/floor.png';
import grassImg from '../assets/flat/grass.png';
import playerOnFloorImg from '../assets/flat/playerOnFloor.png';
import playerOnTargetImg from '../assets/flat/playerOnTarget.png';
import targetImg from '../assets/flat/target.png';
import wallImg from '../assets/flat/wall.png';
import PropTypes from "prop-types";

// Function to refresh the access token
const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch("/api/token/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token. Please log in again.");
      }

      const data = await response.json();

      // Update tokens in localStorage
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      return data.access_token;
    } catch (err) {
      console.error("Token refresh error:", err.message);
      throw err;
    }
  };

const username = localStorage.getItem('username');

// Hilfsfunktion zum Suchen der Spielerposition im Design-Array
const findPlayerPosition = (design) => {
    for (let y = 0; y < design.length; y++) {
        const x = design[y].indexOf('@');
        if (x !== -1) return { x, y };
    }
    return null; // Fehlervermeidung, falls kein Spieler gefunden wird
};

// Funktion, um herauszufinden, ob alle Kisten an deren Platz sind
const checkWinCondition = (design) => {
    for (let row of design) {
        if (row.includes('.') || row.includes('+')) {
            return false;
        }
    }
    return true;
};

// Hilfsfunktion zur Aktualisierung des Levels mit der neuen Spielerposition
const updateDesignWithPlayerPosition = (design, newPosition, oldPosition) => {
    return design.map((row, y) => {
        if (y === oldPosition.y) {
            // Wenn der Spieler sich von einer Zielposition (+) wegbewegt, wird die Position wieder zu `.`, sonst zu `-`
            const oldChar = design[oldPosition.y][oldPosition.x];
            const replacementChar = oldChar === '+' ? '.' : '-';
            row = row.slice(0, oldPosition.x) + replacementChar + row.slice(oldPosition.x + 1);
        }
        if (y === newPosition.y) {
            const newChar = design[newPosition.y][newPosition.x];
            if (newChar === '.') {
                // Spieler bewegt sich auf eine Zielposition
                row = row.slice(0, newPosition.x) + '+' + row.slice(newPosition.x + 1);
            } else {
                // Spieler bewegt sich auf eine normale Position
                row = row.slice(0, newPosition.x) + '@' + row.slice(newPosition.x + 1);
            }
        }
        return row;
    });
};

const renderCell = (cell) => {
    switch (cell) {
        case '@': // Spieler
            return <img src={playerOnFloorImg} alt="Player" />;
        case '+': // Spieler
            return <img src={playerOnTargetImg} alt="Player" />;
        case '$': // Kiste
            return <img src={boxOnFloorImg} alt="Box" />;
        case '#': // Wand
            return <img src={wallImg} alt="Wall" />;
        case '.': // Ziel
            return <img src={targetImg} alt="Target" />;
        case '-': // Boden
            return <img src={floorImg} alt="Floor" />;
        case '*': // Kiste auf Ziel
            return <img src={boxOnTargetImg} alt="Box on Target" />;
        default: // Gras als default Bild
            return <img src={grassImg} alt="Grass" />;
    }
};

// Verwaltung der Spiellogik und des Spielfelds
const GameLogic = ({levels, currentLevelIndex, onLevelComplete}) => {
    const [currentLevel, setCurrentLevel] = useState(levels[currentLevelIndex]);
    const [playerPosition, setPlayerPosition] = useState({ x: null, y: null });
    const [highscore, setHighscore] = useState(10000);

    useEffect(() => {
        if (levels.length > 0) {
            const level = levels[currentLevelIndex];
            const startPosition = findPlayerPosition(level.design);
            setPlayerPosition(startPosition);
            setCurrentLevel(level);
        }
    }, [currentLevelIndex, levels]);

    const handleKeyDown = async (event) => {
        const {x, y} = playerPosition;
        let newPosition = {x, y};
        let nextPosition = {x, y}; // Position der Kiste

        // Bestimme die neue Position basierend auf der Pfeiltaste
        switch (event.key) {
            case 'ArrowUp':
                newPosition = {x, y: y - 1};
                nextPosition = {x, y: y - 2}; // Position hinter der Kiste (falls Kiste vorhanden)
                setHighscore(highscore - 1);
                break;
            case 'ArrowDown':
                newPosition = {x, y: y + 1};
                nextPosition = {x, y: y + 2};
                setHighscore(highscore - 1);
                break;
            case 'ArrowLeft':
                newPosition = {x: x - 1, y};
                nextPosition = {x: x - 2, y};
                setHighscore(highscore - 1);
                break;
            case 'ArrowRight':
                newPosition = {x: x + 1, y};
                nextPosition = {x: x + 2, y};
                setHighscore(highscore - 1);
                break;
            default:
                return;
        }

        const newChar = currentLevel.design[newPosition.y][newPosition.x];
        const nextChar = currentLevel.design[nextPosition.y]?.[nextPosition.x];

        // Prüfe, ob die neue Position eine Kiste ist
        if (newChar === '$' || newChar === '*') {
            // Überprüfe, ob die Position hinter der Kiste frei ist
            if (nextChar && nextChar !== '#' && nextChar !== '$' && nextChar !== '*') {
                // Aktualisiere die Kiste auf der neuen Position
                currentLevel.design[nextPosition.y] = currentLevel.design[nextPosition.y].slice(0, nextPosition.x) +
                    (nextChar === '.' ? '*' : '$') + currentLevel.design[nextPosition.y].slice(nextPosition.x + 1);

                // Aktualisiere die alte Position der Kiste
                currentLevel.design[newPosition.y] = currentLevel.design[newPosition.y].slice(0, newPosition.x) +
                    (newChar === '*' ? '.' : '-') + currentLevel.design[newPosition.y].slice(newPosition.x + 1);

                // Aktualisiere die Position des Spielers
                const newDesign = updateDesignWithPlayerPosition(currentLevel.design, newPosition, playerPosition);
                setCurrentLevel((prevLevel) => ({...prevLevel, design: newDesign}));
                setPlayerPosition(newPosition);

                // Überprüfen, ob das Level gewonnen ist
                if (checkWinCondition(newDesign)) {
                    // TODO: Highscore testen
                    try {
                        const accessToken = localStorage.getItem('accessToken'); // Retrieve the token
                
                        const response = await fetch('/api/highscore/add', {
                            method: 'POST', 
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`, // Add the token here
                            },
                            body: JSON.stringify({ "name": username, "score": highscore }),
                        });

                        if (response.status === 401) {
                            // If unauthorized, try refreshing the token
                            const newAccessToken = await refreshAccessToken(refreshToken);
                      
                            // Retry the original request with the new access token
                            const retryResponse = await fetch('/api/highscore/add', {
                              method: 'GET',
                              headers: {
                                  Authorization: `Bearer ${newAccessToken}`,
                              },
                            });
                      
                            if (!retryResponse.ok) {
                              throw new Error(`Request failed with status ${retryResponse.status}`);
                            }
                      
                            return await retryResponse.json();
                          }
                
                        const data = await response.json();
                
                        if (!response.ok) {
                            throw new Error(data.error || 'Highscore submission failed');
                        }
                    } catch (e) {
                        console.log(e);
                    }
                
                    onLevelComplete();
                }
                
            }
        }
        // Überprüfe, ob die neue Position begehbar ist
        else if (newChar !== '#') {
            const newDesign = updateDesignWithPlayerPosition(currentLevel.design, newPosition, playerPosition);
            setCurrentLevel((prevLevel) => ({...prevLevel, design: newDesign}));
            setPlayerPosition(newPosition);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentLevel, playerPosition]);

    if (!currentLevel) return <div>Lädt...</div>;
    // Spiel mit Zeichen (nicht zentriert)
    //return <pre>{currentLevel.design.join('\n')}</pre>;
    // Spiel mit Bildern (zentriert)
    return (
        <div>
            {currentLevel.design.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex' }}>
                    {row.split('').map((cell, cellIndex) => (
                        <div key={`${rowIndex}-${cellIndex}`} style={{ width: '16px', height: '16px' }}>
                            {renderCell(cell)}
                        </div>
                    ))}
                </div>
            ))}
            <p>Current Score: {highscore}</p>
        </div>
    );
};

GameLogic.propTypes = {
    levels: PropTypes.node,
    currentLevelIndex: PropTypes.number,
    onLevelComplete: PropTypes.func.isRequired
}

export default GameLogic;