const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor({ storageService }) {
    this.pool = new Pool();
    this.storageService = storageService;
  }

  async add({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    const songsByAlbumId = await this.pool.query({
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    });

    const mappingSongs = songsByAlbumId.rows.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows[0];
    const mappingAlbum = {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover,
    };

    return {
      ...mappingAlbum,
      songs: mappingSongs,
    };
  }

  async editById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async updateCoverById(id, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [filename, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async uploadCover({ id, file, meta }) {
    const filename = await this.storageService.writeFile(file, meta);

    await this.updateCoverById(id, filename);

    return filename;
  }
}

module.exports = AlbumsService;
