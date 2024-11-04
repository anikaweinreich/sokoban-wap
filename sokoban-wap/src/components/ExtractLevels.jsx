import React, { useEffect } from 'react';

const ExtractLevels = ({ setLevels }) => {
    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const response = await fetch('/levels.txt');
                if (!response.ok) throw new Error('Failed to load levels');
                const text = await response.text();
                parseLevels(text);
            } catch (error) {
                console.error(error);
            }
        };

        const parseLevels = (text) => {
            const levels = [];
            const lines = text.split('\n');
            let currentLevel = { design: [], title: '', comment: '' };

            for (let line of lines) {
                if (line.trim() === '') {
                    if (currentLevel.design.length > 0) {
                        levels.push(currentLevel);
                        currentLevel = { design: [], title: '', comment: '' };
                    }
                    continue;
                }

                if (['-', '#', '$', '@'].some(char => line.startsWith(char))) {
                    currentLevel.design.push(line);
                } else if (line.startsWith('Title: ')) {
                    currentLevel.title = line.replace('Title: ', '').trim();
                } else if (line.startsWith('Comment: ')) {
                    currentLevel.comment = line.replace('Comment: ', '').trim();
                }
            }

            if (currentLevel.design.length > 0) {
                levels.push(currentLevel); // Final level push if any
            }
            setLevels(levels);
        };

        fetchLevels();
    }, [setLevels]); // Dependency array ensures fetchLevels runs only once

    return null; // This component does not render anything itself
};

export default ExtractLevels;
