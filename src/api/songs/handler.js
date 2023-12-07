class SongsHandler {
  constructor(service, validator) {
    this.svc = service;
    this.vldtr = validator;
  }

  async postSongHandler(request, h) {
    this.vldtr.validateSongs(request.payload);
    const { title, year, performer, genre, duration, albumId } = request.payload;

    const body = {
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    };
    const songId = await this.svc.add(body);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });

    response.code(201);

    return response;
  }

  async getSongsHandler(request) {
    const { query } = request;
    const songs = await this.svc.getAll(query);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this.svc.getById(id);
    const mappingSong = {
      id: song.id,
      title: song.title,
      year: song.year,
      performer: song.performer,
      genre: song.genre,
      duration: song.duration,
      albumId: song.albumId,
    };
    return {
      status: 'success',
      data: {
        song: mappingSong,
      },
    };
  }

  async putSongByIdHandler(request) {
    this.vldtr.validateSongs(request.payload);
    const { id } = request.params;

    await this.svc.editById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this.svc.deleteById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
