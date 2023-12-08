const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class PlaylistSongsService {
  constructor({ songsService, playlistActivitiesService }) {
    this.pool = new Pool();
    this.songsService = songsService;
    this.playlistActivitiesService = playlistActivitiesService;
  }

  async addSongToPlaylist({ playlistId, songId, userId }) {
    const song = await this.songsService.getById(songId);

    const id = `playlistsongs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, song.id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this.playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: 'add',
      time: new Date().toISOString(),
    });
  }

  async deleteSongFromPlaylist({ playlistId, songId, userId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    await this.playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: 'delete',
      time: new Date().toISOString(),
    });
  }
}

module.exports = PlaylistSongsService;
