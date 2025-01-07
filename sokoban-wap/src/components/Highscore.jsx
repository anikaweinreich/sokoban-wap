import { useState, useEffect } from "react";

function Highscore() {
  const [highscores, setHighscores] = useState([]);
  const [error, setError] = useState("");

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken || !refreshToken) {
    throw new Error("No tokens found. Please log in.");
  }

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

  // fetch highscores from backend
  const fetchHighscores = async () => {
    try {
        const response = await fetch('/api/highscore', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.status === 401) {
          // If unauthorized, try refreshing the token
          const newAccessToken = await refreshAccessToken(refreshToken);
    
          // Retry the original request with the new access token
          const retryResponse = await fetch('/api/highscore', {
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
