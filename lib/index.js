const { error } = require('lambda-console');
const { join } = require('path');
const { getBasePath } = require('./getBasePath');
const { callbackify } = require('lambda-callbackify');
const { get } = require('caseless-get');

const redirect = (options = {}) => {
  return next => {
    next = callbackify(next);

    return (event, context, callback) => {
      const redirectContext = {
        done: false,
      };

      context.redirect = (statusCode, url, options) => {
        if (typeof statusCode !== 'number') {
          [statusCode, url, options] = [302, statusCode, url];
        }

        if (options) {
          url = makeUrlWithReturnTo(url, options, event);
        }

        /*
         * Record that the redirect is called.
         */
        redirectContext.done = true;

        /*
         * If the url is an absolute path, redirect with the url.
         */
        if (url.startsWith('//') || url.startsWith('http:') || url.startsWith('https:')) {
          return callback(null, {
            statusCode,
            headers: {
              Location: url,
            },
          });
        }

        /*
         * Add a base path when a relative path is specified.
         */
        callback(null, {
          statusCode,
          headers: {
            Location: join(getBasePath(event), url),
          },
        });
      };

      if (event.path === '/' && !event.requestContext.path.endsWith('/')) {
        context.redirect(301, '/');
        return;
      }

      /*
       * Warn that a subsequent lambda must not call a callback if the redirect is called already.
       */
      next(event, context, (err, result) => {
        if (redirectContext.done) {
          error(new Error('Callback must not be called after redirect'));
          return;
        }

        return callback(err, result);
      });
    };
  };
};

function makeUrlWithReturnTo(url, options, event) {
  let {
    param,
  } = options;

  if (!param) {
    return url;
  }

  if (param === true) {
    param = 'return_to';
  }

  const {
    headers,
    path,
  } = event;

  const host = get(headers, 'host');

  const returnUrl = `https://${host}${path}`;

  const symbol = url.indexOf('?') >= 0 ? `&` : `?`;

  return `${url}${symbol}${param}=${encodeURIComponent(returnUrl)}`;
}

/*
 * Exports.
 */
exports.redirect = redirect;
