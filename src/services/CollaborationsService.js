const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class CollaborationsService {
  constructor({ usersService, cacheService }) {
    this.pool = new Pool();
    this.usersService = usersService;
    this.cacheService = cacheService;
  }

  addCollaboration = async (playlistId, userId) => {
    const user = await this.usersService.getUserById(userId);
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, user.id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    // Delete cache when new collaboration is added
    await this.cacheService.delete(`playlists:${user.id}`);

    return result.rows[0].id;
  };

  deleteCollaboration = async (playlistId, userId) => {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }

    // Delete cache when collaboration is deleted
    await this.cacheService.delete(`playlists:${userId}`);
  };

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
