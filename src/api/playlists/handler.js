class PlaylistsHandler {
  constructor(service, validator) {
    this.svc = service;
    this.vldtr = validator;
  }

  async postPlaylistHandler(request, h) {
    this.vldtr.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this.svc.addPlaylist({
      name,
      owner,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.svc.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this.svc.deletePlaylistById({
      playlistId,
      owner,
    });

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this.vldtr.validatePostSongPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this.svc.addSongToPlaylist({
      playlistId,
      songId,
      owner,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistWithSongsHandler(request) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    const playlist = await this.svc.getPlaylistWithSongs({
      playlistId,
      owner,
    });

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this.vldtr.validateDeleteSongPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this.svc.deleteSongFromPlaylist({
      playlistId,
      songId,
      owner,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistWithActivitiesHandler(request) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    const playlist = await this.svc.getPlaylistWithActivities({
      playlistId,
      owner,
    });

    return {
      status: 'success',
      data: {
        ...playlist,
      },
    };
  }
}

module.exports = PlaylistsHandler;
