const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class AlbumLikesService {
  constructor({ cacheService }) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addLike({ albumId, userId }) {
    const isAlreadyLiked = await this.isAlreadyLiked({
      albumId,
      userId,
    });

    if (isAlreadyLiked) {
      throw new InvariantError('Album sudah dilike');
    }

    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    // Delete cache when new like is added
    await this.cacheService.delete(`likes:${albumId}`);

    return result.rows[0].id;
  }

  async getTotalLikesByAlbumId(albumId) {
    // First gt the data from cache (if any)
    const caches = await this.cacheService.get(`likes:${albumId}`);
    if (caches !== null) {
      return JSON.parse(caches);
    }

    const query = {
      text: 'SELECT COUNT(id) FROM album_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this.pool.query(query);

    const likes = result.rows[0].count;

    const body = {
      likes,
      isFromCache: false,
    };

    // Save the data to cache
    await this.cacheService.set(
      `likes:${albumId}`,
      JSON.stringify({
        ...body,
        isFromCache: true,
      }),
    );

    return body;
  }

  async deleteLike({ albumId, userId }) {
    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus like. Id tidak ditemukan');
    }

    // Delete cache when a like is deleted
    await this.cacheService.delete(`likes:${albumId}`);
  }

  async isAlreadyLiked({ albumId, userId }) {
    const query = {
      text: 'SELECT * FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      return false;
    }

    return true;
  }
}

module.exports = AlbumLikesService;
