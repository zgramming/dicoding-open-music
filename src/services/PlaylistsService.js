const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor({ playlistSongsService, songsService, playlistActivitiesService }) {
    this.pool = new Pool();
    this.playlistSongsService = playlistSongsService;
    this.songsService = songsService;
    this.playlistActivitiesService = playlistActivitiesService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1`,
      values: [owner],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deletePlaylistById({ playlistId, owner }) {
    try {
      await this.verifyPlaylistOwner(playlistId, owner);
      const query = {
        text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
        values: [playlistId],
      };

      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
      }
    } catch (error) {
      console.log({
        message: error.message,
        stack: error.stack,
        error,
      });
      throw error;
    }
  }

  async addSongToPlaylist({ owner, playlistId, songId }) {
    await this.verifyPlaylistOwner(playlistId, owner);
    await this.playlistSongsService.addSongToPlaylist(playlistId, songId);
  }

  async getPlaylistWithSongs({ owner, playlistId }) {
    await this.verifyPlaylistOwner(playlistId, owner);

    const playlist = await this.getPlaylistById(playlistId);

    const songs = await this.songsService.getSongsFromPlaylist(playlistId);

    return {
      ...playlist,
      songs,
    };
  }

  async deleteSongFromPlaylist({ owner, playlistId, songId }) {
    await this.verifyPlaylistOwner(playlistId, owner);
    await this.playlistSongsService.deleteSongFromPlaylist(playlistId, songId);
  }

  async getPlaylistWithActivities({ owner, playlistId }) {
    await this.verifyPlaylistOwner(playlistId, owner);

    const playlist = await this.getPlaylistById(playlistId);

    const activities = await this.playlistActivitiesService.getActivitiesByPlaylistId(playlistId);

    return {
      playlistId: playlist.id,
      activities,
    };
  }

  //* Private method

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
