const { SERVER_AUTH_STRATEGY_NAME } = require('../../utils/constant');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: (request, h) => handler.postExportPlaylistHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
];

module.exports = routes;
