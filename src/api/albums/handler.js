class AlbumsHandler {
  constructor(service, validator) {
    this.svc = service;
    this.vldtr = validator;
  }

  async postAlbumsHandler(request, h) {
    this.vldtr.validateAlbums(request.payload);
    const { name, year } = request.payload;

    const body = {
      name,
      year,
    };
    const albumId = await this.svc.add(body);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);

    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this.svc.getById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this.vldtr.validateAlbums(request.payload);
    const { id } = request.params;

    await this.svc.editById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this.svc.deleteById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
