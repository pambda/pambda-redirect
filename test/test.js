const test = require('tape');

process.env.AWS_REGION = 'us-west-2';

const {
  makeRedirector,
  redirect,
} = require('..');

test('redirect to a path in a custom domain', t => {
  t.plan(3);

  const pambda = redirect({
    basePathMap: {
      'example.com': '/',
    },
  });

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
    t.equal(result.headers.Location, '/login');
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
    t.equal(result.headers.Location, '/Stage/login');
  });
});

test('redirect from a path with path parameters', t => {
  t.plan(3);

  const pambda = redirect();

  const lambda = pambda((event, context, callback) => {
    context.redirect('/login');
  });

  const event = {
    path: '/test',
    headers: {
      host: '0123456789.execute-api.us-west-2.amazonaws.com',
    },
    requestContext: {
      path: '/Stage/{params+}',
      stage: 'Stage',
    },
  };

  lambda(event, {}, (err, result) => {
    t.error(err);

    t.equal(result.statusCode, 302);
    t.equal(result.headers.Location, '/Stage/login');
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
    t.equal(result.headers.Location, '/Stage/');
  });
});

test('redirect to a path with return_to param and headers', t => {
  t.plan(4);

  const pambda = redirect();

  const lambda = pambda((event, context, callback) => {
    context.redirect('/login', {
      param: true,
      headers: {
        'x-custom': 'test',
      }
    });
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
    t.equal(result.headers.Location, '/login?return_to=https%3A%2F%2Fexample.com%2F');
    t.equal(result.headers['x-custom'], 'test');
  });
});

test('test makeRedirector', t => {
  t.plan(3);

  const pambda = makeRedirector(301, 'https://test.example.com');

  const lambda = pambda((event, context, callback) => {
    throw 'A sequent pambda must not be called';
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

    t.equal(result.statusCode, 301);
    t.equal(result.headers.Location, 'https://test.example.com');
  });
});
