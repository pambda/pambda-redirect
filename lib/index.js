const { error } = require('lambda-console');
const { join } = require('path');
const { getBasePath } = require('./getBasePath');
const { callbackify } = require('lambda-callbackify');

const redirect = (options = {}) => {
  return next => {
    next = callbackify(next);

    return (event, context, callback) => {
      const redirectContext = {
        done: false,
      };

      context.redirect = (statusCode, url) => {
        if (url === undefined) {
          [statusCode, url] = [302, statusCode];
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

/*
 * Exports.
 */
exports.redirect = redirect;
