//oAuth model
import bcrypt from 'bcrypt';

const client = {
  id: 'sokoban',
  grants: ['password', 'refresh_token'],
};

export default function oAuthModel(db) {
  return {
      getClient() {
          return client;
      },
      async getAccessToken(accessToken) {
          const token = await db.collection('token').findOne({ accessToken });
          if (token) {
              token.client = client;
              token.user = await db.collection('user_auth').findOne({ _id: token.user_id });
          }
          return token;
      },
      async getRefreshToken(refreshToken) {
          const token = await db.collection('token').findOne({ refreshToken });
          if (token) {
              token.client = client;
              token.user = await db.collection('user_auth').findOne({ _id: token.user_id });
          }
          return token;
      },
      async getUser(username, password) {
          const user = await db.collection('user_auth').findOne({ username });
          if (user) {
              const passwordMatch = await bcrypt.compare(password, user.password);
              if (passwordMatch) return user;
          }
          return null;
      },
      async saveToken(token, client, user) {
          await db.collection('token').insertOne({
              accessToken: token.accessToken,
              accessTokenExpiresAt: token.accessTokenExpiresAt,
              refreshToken: token.refreshToken,
              refreshTokenExpiresAt: token.refreshTokenExpiresAt,
              user_id: user._id,
          });
          return { ...token, client, user };
      },
  };
}