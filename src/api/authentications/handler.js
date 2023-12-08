class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.authenticationsSvc = authenticationsService;
    this.usersSvc = usersService;
    this.tokenManager = tokenManager;
    this.vldtr = validator;
  }

  async postAuthenticationHandler(request, h) {
    this.vldtr.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this.usersSvc.verifyUserCredential(username, password);

    const payload = {
      id,
    };
    const accessToken = this.tokenManager.generateAccessToken(payload);
    const refreshToken = this.tokenManager.generateRefreshToken(payload);

    await this.authenticationsSvc.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    this.vldtr.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this.authenticationsSvc.verifyRefreshToken(refreshToken);
    const { id } = this.tokenManager.verifyRefreshToken(refreshToken);

    const payload = {
      id,
    };

    const accessToken = this.tokenManager.generateAccessToken(payload);
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    this.vldtr.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this.authenticationsSvc.verifyRefreshToken(refreshToken);
    await this.authenticationsSvc.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
