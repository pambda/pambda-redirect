const test = require('tape');

process.env.AWS_REGION = 'us-west-2';

const { redirect } = require('..');

test('redirect to a path in a custom domain', t => {
  t.plan(3);

  const pambda = redirect();

  const lambda = pambda((event, context, callback) => {
    context.redirect('/login');
  });

  const event = {
    path: '/',
    headers: {
      host: 'example.com',
    },
    requestContext: {
      path: '/',
      stage: 'Prod',
    },
  };

  lambda(event, {}, (err, result) => {
    t.error(err);

    t.equal(result.statusCode, 302);
    t.ok(result.headers.Location, '/login');
  });
});

test('redirect to a path in an api gateway domain', t => {
  t.plan(3);

  const pambda = redirect();

  const lambda = pambda((event, context, callback) => {
    context.redirect('/login');
  });

  const event = {
    path: '/',
    headers: {
      host: '0123456789.execute-api.us-west-2.amazonaws.com',
    },
    requestContext: {
      path: '/Stage/',
      stage: 'Stage',
    },
  };

  lambda(event, {}, (err, result) => {
    t.error(err);

    t.equal(result.statusCode, 302);
    t.ok(result.headers.Location, '/Stage/login');
  });
});

test('normalize accessing to a root resource', t => {
  t.plan(3);

  const pambda = redirect();

  const lambda = pambda((event, context, callback) => {
    callback(new Error('Not normalized'));
  });

  const event = {
    path: '/',
    headers: {
      host: '0123456789.execute-api.us-west-2.amazonaws.com',
    },
    requestContext: {
      path: '/Stage',
      stage: 'Stage',
    },
  };

  lambda(event, {}, (err, result) => {
    t.error(err);

    t.equal(result.statusCode, 301);
    t.ok(result.headers.Location, '/Stage/');
  });
});
