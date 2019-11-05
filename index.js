const processRedirect = require('./processRedirect');

const defaults = {
  statusCode: 301,
  appendQueryString: true,
  log: false,
  log404: false,
  verbose: false
};

module.exports = (routeTable, request, pluginOptions) => {
  // set up options:
  const options = Object.assign({}, defaults, pluginOptions);
  if (options.statusCode === 'temporary') {
    options.statusCode = 302;
  }
  if (options.statusCode === 'permanent') {
    options.statusCode = 301;
  }

  // takes in routeTable, { path, query, params }, options
  // returns a { statusCode, redirectRoute }:
  const registerRedirects = (routeTable, request, options) => {
    // support both '{ /path: /redirect}' and { redirects : { /path: /redirect} }
    routeTable = routeTable.redirects || routeTable;
    Object.keys(routeTable).forEach(path => {
      if (!request.path.startsWith('/')) {
        routeTable[`/${request.path}`] = routeTable[request.path];
        request.path = `/${request.path}`;
      }
      return processRedirect(routeTable, request, options);
    });
  };

  if (options.redirects) {
    registerRedirects(options.redirects);
  }
};
