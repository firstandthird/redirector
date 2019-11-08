const tap = require('tap');
const getRedirect = require('../index.js');

tap.test(' /test -> /it/works   /something/else -> /it/works', async t => {
  let redirect = getRedirect({
    '/test': '/it/works',
    '/something/else': '/it/works'
  }, '/test');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  redirect = getRedirect({
    '/test': '/it/works',
    '/something/else': '/it/works'
  }, '/something/else');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' /test -> https://google.com with query', async t => {
  const redirect = getRedirect({
    '/test': 'https://google.com/?id=2',
    '/something/else': '/it/works'
  }, '/test?token=1');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, 'https://google.com/?id=2&token=1');
  t.end();
});

tap.test(' / -> /it/works?test=1', async t => {
  const redirect = getRedirect({
    '/': '/it/works?test=1',
  }, '/');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works?test=1');
  t.end();
});

tap.test('set default status code', async(t) => {
  const redirect = getRedirect({
    '/': '/it/works',
  }, '/',
  { statusCode: 302 });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test('set default status code with "temporary"', async(t) => {
  const redirect = getRedirect({
    '/': '/it/works',
  }, '/',
  { statusCode: 'temporary' });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test('set default status code with "permanent"', async(t) => {
  const redirect = getRedirect({
    '/': '/it/works',
  }, '/',
  { statusCode: 'permanent' });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' set status code for specific route (without params)', async(t) => {
  let redirect = getRedirect({
    '/test301': '/it/works',
    '/test302': {
      destination: '/it/works',
      statusCode: 302
    }
  }, '/test302', { statusCode: 301 });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  redirect = getRedirect({
    '/test301': '/it/works',
    '/test302': {
      destination: '/it/works',
      statusCode: 302
    }
  }, '/test301', { statusCode: 301 });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' / -> /to/{params*}', async(t) => {
  const redirect = getRedirect({
    '/{params*}': '/to/{params*}',
  }, { path: '/some/params/here', query: {}, params: { params: 'some/params/here' } },
  { appendQueryString: false });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/some/params/here');
  t.end();
});

tap.test(' /from/{param}/?query=1 -> /to/{param}?query=1', async(t) => {
  const redirect = getRedirect({
    '/from/{param*}': '/to/{param*}',
  }, { path: '/from/test?query=1', query: { query: 1 }, params: { param: 'test' } },
  { appendQueryString: false });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/test?query=1');
  t.end();
});

tap.test(' /test/{params*2} -> /newtest/{param*2}', async(t) => {
  const redirect = getRedirect({
    '/test/{param*2}': '/newtest/{param*2}'
  }, { path: '/test/param1/param2', query: { }, params: { param: 'param1/param2' } },
  { appendQueryString: false });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/newtest/param1/param2');
  t.end();
});

tap.test('set status code for specific route (with params)', async(t) => {
  const redirect = getRedirect({
    '/test/{param*2}': {
      destination: '/newtest/{param*2}',
      statusCode: 302
    }
  }, { path: '/test/param1/param2', query: { }, params: { param: 'param1/param2' } },
  { appendQueryString: false });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/newtest/param1/param2');
  t.end();
});
