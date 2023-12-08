const { SERVER_AUTH_STRATEGY_NAME } = require('../../utils/constant');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: (request, h) => handler.postCollaborationHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: (request, h) => handler.deleteCollaborationHandler(request, h),
    options: {
      auth: SERVER_AUTH_STRATEGY_NAME,
    },
  },
];

module.exports = routes;
