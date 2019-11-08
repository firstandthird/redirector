const querystring = require('query-string');
const processRedirect = require('./processRedirect');
const Call = require('@hapi/call');
const defaults = {
  statusCode: 301,
  appendQueryString: true,
  log: false,
  log404: false,
  verbose: false
};

module.exports = (routeTable, request, pluginOptions) => {
  if (typeof request === 'string') {
    // transform path to get queries:
    const query = querystring.parse(request.split('?')[1]);
    const path = request.split('?')[0];
    request = { path, query, params: {} };
  }
  // set up options:
  const options = Object.assign({}, defaults, pluginOptions);
  if (options.statusCode === 'temporary') {
    options.statusCode = 302;
  }
  if (options.statusCode === 'permanent') {
    options.statusCode = 301;
  }
  // support both '{ /path: /redirect}' and { redirects : { /path: /redirect} }
  routeTable = routeTable.redirects || routeTable;
  Object.keys(routeTable).forEach(routePath => {
    if (!routePath.startsWith('/')) {
      routeTable[`/${routePath}`] = routeTable[routePath];
    }
  });
  // figure out what route to use:
  const router = new Call.Router();
  Object.keys(routeTable).forEach((source) => {
    router.add({ method: 'get', path: source });
  });
  const match = router.route('get', request.path, '');
  if (match.route) {
    return processRedirect(routeTable[match.route], request, options);
  }
  return false;
};
