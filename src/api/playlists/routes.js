const { SERVER_AUTH_STRATEGY_NAME } = require('../../utils/constant');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request, h) => handler.getPlaylistsHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}',
    handler: (request, h) => handler.deletePlaylistByIdHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: (request, h) => handler.postSongToPlaylistHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: (request, h) => handler.getPlaylistWithSongsHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: (request, h) => handler.deleteSongFromPlaylistHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/activities',
    handler: (request, h) => handler.getPlaylistWithActivitiesHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
];

module.exports = routes;
