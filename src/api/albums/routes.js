const { cwd } = require('process');
const { SERVER_AUTH_STRATEGY_NAME } = require('../../utils/constant');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: (request, h) => handler.postAlbumsHandler(request, h),
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: (request) => handler.getAlbumByIdHandler(request),
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: (request) => handler.putAlbumByIdHandler(request),
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: (request) => handler.deleteAlbumByIdHandler(request),
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: (request, h) => handler.postAlbumsUploadCoverHandler(request, h),
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 500000, // 500 kB
      },
    },
  },
  {
    method: 'GET',
    path: '/uploads/covers/{param*}',
    handler: {
      directory: {
        path: `${cwd()}/public/uploads/covers`,
      },
    },
  },

  // Album Likes
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.postAlbumLikesHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getTotalLikesByAlbumIdHandler(request, h),
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.postUnlikeAlbumByIdHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
];

module.exports = routes;
