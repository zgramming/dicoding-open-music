const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

const AlbumCoverHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp')
    .required(),
}).unknown();

const AlbumLikesPayloadSchema = Joi.object({
  albumId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = {
  AlbumPayloadSchema,
  AlbumCoverHeadersSchema,
  AlbumLikesPayloadSchema,
};
