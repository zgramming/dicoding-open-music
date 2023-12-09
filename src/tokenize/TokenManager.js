const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
const { config } = require('../utils/constant');

const TokenManager = {
  generateAccessToken(payload) {
    return Jwt.token.generate(payload, config.jwtOptions.accessTokenKey);
  },
  generateRefreshToken(payload) {
    return Jwt.token.generate(payload, config.jwtOptions.refreshTokenKey);
  },
  verifyRefreshToken(refreshToken) {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.jwtOptions.refreshTokenKey);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
