// oAuthModel.js
export default function oAuthModel(db) {
  // Hardcoded client details
  const client = {
    id: 'client',
    grants: ['password', 'refresh_token'], // Supported OAuth grants
  };

  return {
    // Return the hardcoded client information
    getClient() {
        return client; // Returns a hardcoded client
      },

    // Get access token from the database by its value
    async getAccessToken(accessToken) {
    // Fetch the token from the database
        const token = await db.collection('tokens').findOne({ accessToken });
        
        // Check if the token exists and is still valid
        if (token && new Date(token.accessTokenExpiresAt) > new Date()) {
            try {
                // Fetch the associated user and attach it to the token
                const user = await db.collection('users').findOne({ _id: new ObjectId(token.user_id) }); // Ensure ObjectId
                token.client = client; // Assuming 'client' is globally accessible or passed in
                token.user = user;

                return token; // Return the valid token with client and user details
            } catch (error) {
                console.error("Error fetching associated user:", error);
                return null; 
            }
        }
        
        // Return null if the token is missing or expired
        return null;
    },
    
    // Get refresh token from the database by its value
    async getRefreshToken(refreshToken) {
      const token = await db.collection('tokens').findOne({ refreshToken });
      if (token) {
        token.client = client;  // Attach the hardcoded client
        token.user = await db.collection('users').findOne({ _id: token.user_id }); 
      }
      return token;
    },

    // Get user based on username and password
    async getUser(username, password) {
        const user = await db.collection('users').findOne({ username });
    
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
    
        return null;
    },
      

    // Save the token to the database (both access and refresh tokens)
    async saveToken(token, client, user) {
      await db.collection('tokens').insertOne({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        user_id: user._id,
        client_id: client.id,  // Store the hardcoded client ID
      });

      return {
        ...token,
        client, 
        user,
      };
    },
  };
}
