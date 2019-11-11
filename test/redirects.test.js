const tap = require('tap');
const getRedirect = require('../index.js');

const redirectTable = {
  '/test': '/it/works',
  '/something/else': '/it/works',
  '/googletest': 'https://google.com/?id=2',
  '/': '/it/works?test=1',
  '/default': '/it/works',
  '/test301': '/it/works',
  '/test302': {
    destination: '/it/works',
    statusCode: 302
  },
  '/{params*}': '/to/{params*}',
  '/from/{param*}': '/to/{param*}',
  '/test/{param*2}': '/newtest/{param*2}',
  '/test2/{param*2}': {
    destination: '/newtest/{param*2}',
    statusCode: 302
  }
};

tap.test(' /test -> /it/works   /something/else -> /it/works', async t => {
  let redirect = getRedirect(redirectTable, '/test');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  redirect = getRedirect(redirectTable, '/something/else');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' /test -> https://google.com with query', async t => {
  const redirect = getRedirect(redirectTable, '/googletest?token=1');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, 'https://google.com/?id=2&token=1');
  t.end();
});

tap.test(' / -> /it/works?test=1', async t => {
  const redirect = getRedirect(redirectTable, '/');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works?test=1');
  t.end();
});

tap.test('set default status code', async(t) => {
  const redirect = getRedirect(redirectTable, '/default', { statusCode: 302 });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test('set default status code with "temporary"', async(t) => {
  const redirect = getRedirect(redirectTable, '/test', { statusCode: 'temporary' });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test('set default status code with "permanent"', async(t) => {
  const redirect = getRedirect(redirectTable, '/test', { statusCode: 'permanent' });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' set status code for specific route (without params)', async(t) => {
  let redirect = getRedirect(redirectTable, '/test302', { statusCode: 301 });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  redirect = getRedirect(redirectTable, '/test301', { statusCode: 301 });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' / -> /to/{params*}', async(t) => {
  const redirect = getRedirect(redirectTable, '/some/params/here', { appendQueryString: false });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/some/params/here');
  t.end();
});

tap.test(' /from/{param}/?query=1 -> /to/{param}?query=1', async(t) => {
  const redirect = getRedirect(redirectTable, '/from/test?query=1');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/test?query=1');
  t.end();
});

tap.test(' /from/{param}/?query=1 -> /to/{param} (appendQueryString is false)', async(t) => {
  const redirect = getRedirect(redirectTable, '/from/test?query=1', { appendQueryString: false });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/test');
  t.end();
});

tap.test(' /test/{params*2} -> /newtest/{param*2}', async(t) => {
  const redirect = getRedirect(redirectTable, '/test/param1/param2', { appendQueryString: false });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/newtest/param1/param2');
  t.end();
});

tap.test('set status code for specific route (with params)', async(t) => {
  const redirect = getRedirect(redirectTable, '/test2/param1/param2', { appendQueryString: false });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/newtest/param1/param2');
  t.end();
});

tap.test(' return false if no redirect found', async t => {
  const redirect = getRedirect({
    '/': '/it/works?test=1',
  }, '/asdfas');
  t.notOk(redirect);
  t.end();
});
