require('fs').readFile('.babelrc', (err, content) => {
  if( err ) throw err;
  try {
    const babelrc = JSON.parse(content);
    require('babel-core/register')(babelrc);

    const boot = require('./src/server').default;
    boot ( server => {
      for ( var key of Object.keys(server.connections) ) {
        let name = server.connections[key].name;
        let uri = server.connections[key].info.uri;
        console.info(`==> 🌎 Hapi Server(${name}) is listening on ${uri}`);
      }
    });
  } catch(e) {
    throw e;
  }
});
