import { useState, useEffect } from 'react';

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
        if (row.includes('.')) {
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

// Verwaltung der Spiellogik und des Spielfelds
const GameLogic = ({levels, currentLevelIndex}) => {
    const [currentLevel, setCurrentLevel] = useState(levels[currentLevelIndex]);
    const [playerPosition, setPlayerPosition] = useState({ x: null, y: null });

    useEffect(() => {
        if (levels.length > 0) {
            const level = levels[currentLevelIndex];
            const startPosition = findPlayerPosition(level.design);
            setPlayerPosition(startPosition);
            setCurrentLevel(level);
        }
    }, [currentLevelIndex, levels]);

    const handleKeyDown = (event) => {
        const { x, y } = playerPosition;
        let newPosition = { x, y };
        let nextPosition = { x, y }; // Position der Kiste

        // Bestimme die neue Position basierend auf der Pfeiltaste
        switch (event.key) {
            case 'ArrowUp':
                newPosition = { x, y: y - 1 };
                nextPosition = { x, y: y - 2 }; // Position hinter der Kiste (falls Kiste vorhanden)
                break;
            case 'ArrowDown':
                newPosition = { x, y: y + 1 };
                nextPosition = { x, y: y + 2 };
                break;
            case 'ArrowLeft':
                newPosition = { x: x - 1, y };
                nextPosition = { x: x - 2, y };
                break;
            case 'ArrowRight':
                newPosition = { x: x + 1, y };
                nextPosition = { x: x + 2, y };
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
                setCurrentLevel((prevLevel) => ({ ...prevLevel, design: newDesign }));
                setPlayerPosition(newPosition);
            }
        }
        // Überprüfe, ob die neue Position begehbar ist
        else if (newChar !== '#') {
            const newDesign = updateDesignWithPlayerPosition(currentLevel.design, newPosition, playerPosition);
            setCurrentLevel((prevLevel) => ({ ...prevLevel, design: newDesign }));
            setPlayerPosition(newPosition);

            // Überprüfen, ob das Level gewonnen ist
            if (checkWinCondition(newDesign)) {
                alert('Level ' + (currentLevelIndex + 1) + ' gewonnen!');
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentLevel, playerPosition]);

    if (!currentLevel) return <div>Lädt...</div>;
    return <pre>{currentLevel.design.join('\n')}</pre>;
};

export default GameLogic;