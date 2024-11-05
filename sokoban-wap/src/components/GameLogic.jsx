import { useState, useEffect } from 'react';

// Hilfsfunktion zum Suchen der Spielerposition im Design-Array
const findPlayerPosition = (design) => {
    for (let y = 0; y < design.length; y++) {
        const x = design[y].indexOf('@');
        if (x !== -1) return { x, y };
    }
    return null; // Fehlervermeidung, falls kein Spieler gefunden wird
};

// Hilfsfunktion zur Aktualisierung des Levels mit der neuen Spielerposition
// - Alte Position wird einfach mit '-' ersetzt -> Altes Feld muss zwischengespeichert werden
const updateDesignWithPlayerPosition = (design, newPosition, oldPosition) => {
    return design.map((row, y) => {
        if (y === oldPosition.y) row = row.slice(0, oldPosition.x) + '-' + row.slice(oldPosition.x + 1);
        if (y === newPosition.y) row = row.slice(0, newPosition.x) + '@' + row.slice(newPosition.x + 1);
        return row;
    });
};

// Verwaltung der Spiellogik und des Spielfelds
const GameLogic = ({levels, currentLevelIndex}) => {
    const [currentLevel, setCurrentLevel] = useState(levels[currentLevelIndex]);
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (levels.length > 0) {
            const level = levels[currentLevelIndex];
            const startPosition = findPlayerPosition(level.design);
            setPlayerPosition(startPosition);
            setCurrentLevel(level);
        }
    }, [currentLevelIndex, levels]);

    // Logik mit Kiste fehlt noch
    const handleKeyDown = (event) => {
        if (!currentLevel || !playerPosition) return;

        const { x, y } = playerPosition;
        let newPosition = { x, y };

        // Bestimme die neue Position basierend auf der Pfeiltaste
        switch (event.key) {
            case 'ArrowUp':
                newPosition = { x, y: y - 1 };
                break;
            case 'ArrowDown':
                newPosition = { x, y: y + 1 };
                break;
            case 'ArrowLeft':
                newPosition = { x: x - 1, y };
                break;
            case 'ArrowRight':
                newPosition = { x: x + 1, y };
                break;
            default:
                return;
        }

        // Überprüfe, ob die neue Position begehbar ist (kein '#')
        if (currentLevel.design[newPosition.y][newPosition.x] !== '#') {
            const newDesign = updateDesignWithPlayerPosition(currentLevel.design, newPosition, playerPosition);
            setCurrentLevel((prevLevel) => ({ ...prevLevel, design: newDesign }));
            setPlayerPosition(newPosition);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentLevel, playerPosition]);

    return <pre>{currentLevel.design.join('\n')}</pre>;
};

export default GameLogic;