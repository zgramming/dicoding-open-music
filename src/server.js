require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const { cwd } = require('process');

const ClientError = require('./exceptions/ClientError');
const { SERVER_AUTH_STRATEGY_NAME, config } = require('./utils/constant');

// Album Section
const albums = require('./api/albums');
const AlbumsService = require('./services/AlbumsService');
const AlbumLikesService = require('./services/AlbumLikesService');
const AlbumsValidator = require('./validator/albums');

// Song Section
const songs = require('./api/songs');
const SongsService = require('./services/SongsService');
const SongsValidator = require('./validator/songs');

// Users Section
const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validator/users');

// Authentication Section
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Playlist Section
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/PlaylistsService');
const PlaylistSongsService = require('./services/PlaylistSongsService');
const PlaylistActivitiesService = require('./services/PlaylistActivitiesService');
const PlaylistsValidator = require('./validator/playlists');

// Collaboration Section
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Export Playlist Section
const exportAPI = require('./api/exports');
const RabbitMQService = require('./services/RabbitMQService');
const ExportsValidator = require('./validator/exports');

// Storage Section
const StorageService = require('./services/StorageService');

// Cache Section
const CacheService = require('./services/CacheService');

const init = async () => {
  const folderAlbumCoverStorage = `${cwd()}/public/uploads/covers`;
  const storageService = new StorageService(folderAlbumCoverStorage);
  const cacheService = new CacheService();
  const albumLikesService = new AlbumLikesService({
    cacheService,
  });
  const albumsService = new AlbumsService({
    storageService,
    albumLikesService,
  });
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService({
    usersService,
    cacheService,
  });
  const playlistActivitiesService = new PlaylistActivitiesService();
  const playlistSongsService = new PlaylistSongsService({
    songsService,
    playlistActivitiesService,
  });
  const playlistsService = new PlaylistsService({
    playlistSongsService,
    songsService,
    playlistActivitiesService,
    collaborationsService,
    cacheService,
  });

  const server = Hapi.server({
    port: config.hapiServerOptions.port,
    host: config.hapiServerOptions.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy(SERVER_AUTH_STRATEGY_NAME, 'jwt', {
    keys: config.jwtOptions.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwtOptions.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exportAPI,
      options: {
        rabbitMQService: RabbitMQService,
        playlistService: playlistsService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
