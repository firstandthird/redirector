const paramReplacer = require('./paramReplacer');
const querystring = require('query-string');
const { parse } = require('url');

module.exports = (routeSpec, request, options, match = false) => {
  // get all the info for doing the redirect from the route spec:
  const statusCode = routeSpec.statusCode || options.statusCode;
  const routePath = typeof routeSpec === 'string' ? routeSpec : routeSpec.destination;
  const redirectTo = paramReplacer(routePath, match ? match.params : request.params);
  const redirectToUrl = parse(redirectTo, true);
  // lump all queries together:
  const allQueries = Object.assign({}, request.query, redirectToUrl.query);
  // if needed, add the queries to the parsed url:
  if (Object.keys(allQueries).length > 0) {
    redirectToUrl.search = `?${querystring.stringify(allQueries)}`;
  }
  // let the url parser format the correct redirect Location:
  const location = redirectToUrl.format();
  return { statusCode, location };
};
