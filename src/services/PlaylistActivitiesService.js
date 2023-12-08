const { Pool } = require('pg');

class PlaylistActivitiesService {
  constructor() {
    this.pool = new Pool();
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
