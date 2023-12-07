const mappingSongFromDB = (song) => ({
  id: song.id,
  title: song.title,
  year: song.year,
  performer: song.performer,
  genre: song.genre,
  duration: song.duration,
  createdAt: song.created_at,
  updatedAt: song.updated_at,
});

module.exports = { mappingSongFromDB };
