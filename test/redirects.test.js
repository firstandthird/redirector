const tap = require('tap');
const getRedirect = require('../index.js');


tap.test(' /test -> /it/works   /something/else -> /it/works', t => {
  const redirectTable = {
    '/test': '/it/works',
    '/something/else': '/it/works',
  };

  let redirect = getRedirect(redirectTable, '/test');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  redirect = getRedirect(redirectTable, '/something/else');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' /test -> https://google.com with query', t => {
  const redirectTable = {
    '/googletest': 'https://google.com/?id=2',
  };
  const redirect = getRedirect(redirectTable, '/googletest?token=1');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, 'https://google.com/?id=2&token=1');
  t.end();
});

tap.test(' / -> /it/works?test=1', t => {
  const redirectTable = {
    '/': '/it/works?test=1',
  };
  const redirect = getRedirect(redirectTable, '/');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works?test=1');
  t.end();
});

tap.test('set default status code', (t) => {
  const redirectTable = {
    '/default': '/it/works',
  };
  const redirect = getRedirect(redirectTable, '/default', { statusCode: 302 });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test('set default status code with "temporary"', (t) => {
  const redirectTable = {
    '/test': '/it/works',
  };
  const redirect = getRedirect(redirectTable, '/test', { statusCode: 'temporary' });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test('set default status code with "permanent"', (t) => {
  const redirectTable = {
    '/test': '/it/works',
  };
  const redirect = getRedirect(redirectTable, '/test', { statusCode: 'permanent' });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' set status code for specific route (without params)', (t) => {
  const redirectTable = {
    '/test301': '/it/works',
    '/test302': {
      destination: '/it/works',
      statusCode: 302
    },
  };
  let redirect = getRedirect(redirectTable, '/test302', { statusCode: 301 });
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/it/works');
  redirect = getRedirect(redirectTable, '/test301', { statusCode: 301 });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/it/works');
  t.end();
});

tap.test(' / -> /to/{params*}', (t) => {
  const redirectTable = {
    '/{params*}': '/to/{params*}',
  };
  const redirect = getRedirect(redirectTable, '/some/params/here');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/some/params/here');
  t.end();
});

tap.test(' /from/{param}/?query=1 -> /to/{param}?query=1', (t) => {
  const redirectTable = {
    '/from/{param*}': '/to/{param*}',
  };
  const redirect = getRedirect(redirectTable, '/from/test?query=1');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/test?query=1');
  t.end();
});

tap.test(' /from/{param}/?query=1 -> /to/{param} (appendQueryString is false)', (t) => {
  const redirectTable = {
    '/from/{param*}': '/to/{param*}',
  };
  const redirect = getRedirect(redirectTable, '/from/test?query=1', { appendQueryString: false });
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/to/test');
  t.end();
});

tap.test(' /test/{params*2} -> /newtest/{param*2}', (t) => {
  const redirectTable = {
    '/test/{param*2}': '/newtest/{param*2}',
  };
  const redirect = getRedirect(redirectTable, '/test/param1/param2');
  t.equal(redirect.statusCode, 301);
  t.equal(redirect.location, '/newtest/param1/param2');
  t.end();
});

tap.test('set status code for specific route (with params)', (t) => {
  const redirectTable = {
    '/test2/{param*2}': {
      destination: '/newtest/{param*2}',
      statusCode: 302
    }
  };
  const redirect = getRedirect(redirectTable, '/test2/param1/param2');
  t.equal(redirect.statusCode, 302);
  t.equal(redirect.location, '/newtest/param1/param2');
  t.end();
});

tap.test(' return false if no redirect found', t => {
  const redirectTable = {
    '/': '/it/works?test=1',
  };
  const redirect = getRedirect({
    '/': '/it/works?test=1',
  }, '/asdfas');
  t.notOk(redirect);
  t.end();
});
