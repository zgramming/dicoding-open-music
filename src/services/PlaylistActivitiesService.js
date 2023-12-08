const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class PlaylistActivitiesService {
  constructor() {
    this.pool = new Pool();
  }

  async addActivity({ playlistId, songId, userId, action, time }) {
    const id = `activities-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Activity gagal ditambahkan');
    }
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `SELECT activity.*, 
             users.username,
             songs.title
             FROM playlist_activities activity
             LEFT JOIN users ON users.id = activity.user_id
             LEFT JOIN songs ON songs.id = activity.song_id
             WHERE activity.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    const mapping = result.rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.created_at,
    }));

    return mapping;
  }
}

module.exports = PlaylistActivitiesService;
