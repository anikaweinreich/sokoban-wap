
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
      const token = await db.collection('tokens').findOne({ accessToken });
      if (token) {
        token.client = client;  // Attach the hardcoded client
        token.user = await db.collection('user_auth').findOne({ _id: token.user_id }); 
      }
      return token;
    },

    // Get refresh token from the database by its value
    async getRefreshToken(refreshToken) {
      const token = await db.collection('tokens').findOne({ refreshToken });
      if (token) {
        token.client = client;  // Attach the hardcoded client
        token.user = await db.collection('user_auth').findOne({ _id: token.user_id }); 
      }
      return token;
    },

    // Get user based on username and password
    async getUser(username, password) {
      return await db.collection('user_auth').findOne({ username, password }); 
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
        client,  // Attach the hardcoded client
        user,
      };
    },
  };
}
