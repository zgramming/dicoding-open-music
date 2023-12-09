const { config } = require('../../utils/constant');

class AlbumsHandler {
  constructor(service, validator) {
    this.svc = service;
    this.vldtr = validator;
  }

  async postAlbumsHandler(request, h) {
    this.vldtr.validateAlbums(request.payload);
    const { name, year } = request.payload;

    const albumId = await this.svc.add({
      name,
      year,
    });

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

  async postAlbumsUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this.vldtr.validateAlbumCoverHeaders(cover.hapi.headers);

    const filename = await this.svc.uploadCover({
      id,
      file: cover,
      meta: cover.hapi,
    });

    const { host, port } = config.hapiServerOptions;
    const fileLocation = `http://${host}:${port}/uploads/covers/${filename}`;
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: {
        fileLocation,
      },
    });

    response.code(201);

    return response;
  }

  async postAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.svc.likeAlbum({
      albumId: id,
      userId: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dilike',
    });

    response.code(201);

    return response;
  }

  async getTotalLikesByAlbumIdHandler(request, h) {
    const { id } = request.params;
    const { likes: totalLikes, isFromCache } = await this.svc.getTotalLikesByAlbumId(id);

    // If is from cache, add custom header property "X-Data-Source = cache"
    const result = h.response({
      status: 'success',
      data: {
        likes: +totalLikes,
      },
    });

    if (isFromCache) {
      // Adding custom header property "X-Data-Source = cache"
      result.header('X-Data-Source', 'cache');

      return result;
    }

    return result;
  }

  async postUnlikeAlbumByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.svc.unlikeAlbum({
      albumId: id,
      userId: credentialId,
    });

    return {
      status: 'success',
      message: 'Album berhasil diunlike',
    };
  }
}

module.exports = AlbumsHandler;
