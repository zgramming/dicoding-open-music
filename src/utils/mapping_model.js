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

const mappingSongInPlaylistFromDB = (song) => ({
  id: song.id,
  title: song.title,
  performer: song.performer,
});

module.exports = {
  mappingSongFromDB,
  mappingSongInPlaylistFromDB,
};
