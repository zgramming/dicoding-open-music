exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
  });

  // memberikan constraint unique, kombinasi dari kolom name dan owner
  pgm.addConstraint('playlists', 'unique_playlist_name', 'UNIQUE(name, owner)');
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
