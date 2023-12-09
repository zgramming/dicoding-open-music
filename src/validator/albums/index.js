const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, AlbumCoverHeadersSchema, AlbumLikesPayloadSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbums: (albums) => {
    const validationResult = AlbumPayloadSchema.validate(albums);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAlbumCoverHeaders: (albums) => {
    const validationResult = AlbumCoverHeadersSchema.validate(albums);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAlbumLikes: (albums) => {
    const validationResult = AlbumLikesPayloadSchema.validate(albums);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
