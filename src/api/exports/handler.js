const { QUEUE_NAME_EXPORT_PLAYLIST } = require('../../utils/constant');

class ExportsHandler {
  constructor({ rabbitMQService, playlistService, validator }) {
    this.rabbitMQService = rabbitMQService;
    this.playlistService = playlistService;
    this.validator = validator;
  }

  async postExportPlaylistHandler(request, h) {
    this.validator.validateExportPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.rabbitMQService.sendMessage(QUEUE_NAME_EXPORT_PLAYLIST, JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
