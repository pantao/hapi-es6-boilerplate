import Config from 'config';

import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import Good from 'good';
import HapiSwagger from 'hapi-swagger';

const getConfig = endpoint => {
  return JSON.parse(JSON.stringify(Config.get(endpoint)));
}

const boot = callback => {

  // 创建 Hapi.Server 对象
  const serverConfig = getConfig('server');

  const server = new Hapi.Server(serverConfig.options)

  server.log(['log', 'server', 'bootstrap'], serverConfig);

  // 创建默认连接
  server.connection(serverConfig.connection);
  server.connections[0].name = 'Hapi React Iosmorphic Boilerplate Connection';
  server.register(Inert);
  server.register(Vision);
  server.register({
    register: Good,
    options: Config.get('logger')
  });

  if (Config.has('public.enable') && Config.get('public.enable')) {
    server.log(['log', 'server', 'bootstrap', 'service', 'config'], getConfig('public'));
    server.route({
      method: 'GET',
      path: '/{params*}',
      config: {
        auth: false,
        state: {
          failAction: 'ignore'
        }
      },
      handler: {
        directory: getConfig('public.options')
      }
    })
  }

  // 注册基础服务
  const services = [];

  if (Config.has('swagger.enable') && Config.get('swagger.enable')) {
    server.log(['log', 'server', 'bootstrap', 'service', 'config'], getConfig('swagger'));
    services.push({
      register: HapiSwagger,
      options: getConfig('swagger.options')
    });
  }

  server.register(services, err => {
    if (err) {
      server.log(['log', 'server', 'bootstrap', 'error'], err);
      throw err;
    }

    return server.start(() => {
      if (typeof callback === 'function')
        callback(server);
    });
  });
};

export default boot;
