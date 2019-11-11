const paramReplacer = require('./paramReplacer');
const querystring = require('query-string');
const { parse } = require('url');

module.exports = (routeSpec, path, options, match = false) => {
  // get all the info for doing the redirect from the route spec:
  const statusCode = routeSpec.statusCode || options.statusCode;
  const routePath = typeof routeSpec === 'string' ? routeSpec : routeSpec.destination;
  const redirectTo = paramReplacer(routePath, match ? match.params : {});
  const redirectToUrl = parse(redirectTo, true);
  // lump all queries together:
  const query = path.includes('?') ? querystring.parse(path.split('?')[1]) : {};
  const allQueries = Object.assign({}, query, redirectToUrl.query);
  // if needed, add the queries to the parsed url:
  if (options.appendQueryString && Object.keys(allQueries).length > 0) {
    redirectToUrl.search = `?${querystring.stringify(allQueries)}`;
  }
  // let the url parser format the correct redirect Location:
  const location = redirectToUrl.format();
  return { statusCode, location };
};
