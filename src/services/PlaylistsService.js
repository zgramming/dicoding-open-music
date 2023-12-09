const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor({ playlistSongsService, songsService, playlistActivitiesService, collaborationsService, cacheService }) {
    this.pool = new Pool();
    this.playlistSongsService = playlistSongsService;
    this.songsService = songsService;
    this.playlistActivitiesService = playlistActivitiesService;
    this.collaborationsService = collaborationsService;
    this.cacheService = cacheService;
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

    // Remove cache if playlist added successfully
    await this.cacheService.delete(`playlists:${owner}`);

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    // First we check the cache if the playlist is already exist in cache or not
    // If exist, we will get the playlist data from cache and return it to the user without querying the database
    // If not exist, we will query the database to get the playlist data

    const caches = await this.cacheService.get(`playlists:${owner}`);
    if (caches) {
      return JSON.parse(caches);
    }

    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username
      `,
      values: [owner],
    };

    const result = await this.pool.query(query);
    const { rows } = result;

    // Store the playlist data to cache
    await this.cacheService.set(`playlists:${owner}`, JSON.stringify(rows));

    return rows;
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
    await this.verifyPlaylistOwner(playlistId, owner);
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    // Remove cache if playlist deleted successfully
    await this.cacheService.delete(`playlists:${owner}`);
  }

  async addSongToPlaylist({ owner, playlistId, songId }) {
    await this.verifyPlaylistAccess(playlistId, owner);
    await this.playlistSongsService.addSongToPlaylist({
      playlistId,
      songId,
      userId: owner,
    });
  }

  async getPlaylistWithSongs({ owner, playlistId }) {
    await this.verifyPlaylistAccess(playlistId, owner);

    const playlist = await this.getPlaylistById(playlistId);

    const songs = await this.songsService.getSongsFromPlaylist(playlistId);

    return {
      ...playlist,
      songs,
    };
  }

  async deleteSongFromPlaylist({ owner, playlistId, songId }) {
    await this.verifyPlaylistAccess(playlistId, owner);
    await this.playlistSongsService.deleteSongFromPlaylist({
      playlistId,
      songId,
      userId: owner,
    });
  }

  async getPlaylistWithActivities({ owner, playlistId }) {
    await this.verifyPlaylistAccess(playlistId, owner);

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

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this.collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
