const querystring = require('query-string');
const processRedirect = require('./processRedirect');
const Call = require('@hapi/call');
const defaults = {
  statusCode: 301,
  appendQueryString: true,
};

module.exports = (routeTable, path, pluginOptions) => {
  // transform path to get queries:
  const query = path.includes('?') ? querystring.parse(path.split('?')[1]) : {};
  path = path.split('?')[0];
  const request = { path, query, params: {} };
  // set up options:
  const options = Object.assign({}, defaults, pluginOptions);
  if (options.statusCode === 'temporary') {
    options.statusCode = 302;
  }
  if (options.statusCode === 'permanent') {
    options.statusCode = 301;
  }
  // figure out what route to use:
  const router = new Call.Router();
  Object.keys(routeTable).forEach(source => {
    if (!source.startsWith('/')) {
      routeTable[`/${source}`] = routeTable[source];
    }
    router.add({ method: 'get', path: source });
  });
  const match = router.route('get', request.path, '');
  if (match.params) {
    request.params = match.params;
  }
  if (match.route) {
    return processRedirect(routeTable[match.route], request, options);
  }
  return false;
};
