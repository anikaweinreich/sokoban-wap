import { useState, useEffect } from "react";

function Highscore() {
  const [highscores, setHighscores] = useState([]);
  const [error, setError] = useState("");

  // fetch highscores from backend
  const fetchHighscores = async () => {
    try {
      const response = await fetch('http://localhost:3000/highscore');
      
      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }

      const data = await response.json(); // Parse response to JSON
      setHighscores(data); // Fill the state with values from the database
    } catch (e) {
      setError("Failed to load high scores");
    }
  };

  useEffect(() => {
    // Define and call an async function inside useEffect
    const getHighscores = async () => {
      await fetchHighscores(); // Call the async function to fetch data
    };
    getHighscores(); // Fetch high scores on component mount
  }, []); // Empty dependency array means this runs only once after the initial render

  return (
    <div style={{ padding: '20px' }}>
      <h2>High Scores</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* High Scores List */}
      <ul>
        {highscores.length > 0 ? (
          highscores.map((score, index) => (
            <li key={index}>
              {score.name}: {score.score}
            </li>
          ))
        ) : (
          <p>No High Scores available yet.</p>
        )}
      </ul>
    </div>
  );
}

export default Highscore;
