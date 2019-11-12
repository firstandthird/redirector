const processRedirect = require('./processRedirect');
const Call = require('@hapi/call');
const defaults = {
  statusCode: 301,
  appendQueryString: true,
};

module.exports = (routeTable, path, pluginOptions) => {
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
  const match = router.route('get', path.split('?')[0], '');
  if (match.route) {
    return processRedirect(routeTable[match.route], path, options, match);
  }
  return false;
};
