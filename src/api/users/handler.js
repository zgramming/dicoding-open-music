class UsersHandler {
  constructor(service, validator) {
    this.svc = service;
    this.vldtr = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this.vldtr.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const body = {
      username,
      password,
      fullname,
    };
    const userId = await this.svc.addUser(body);

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
