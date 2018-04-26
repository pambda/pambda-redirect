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

        redirectContext.done = true;

        if (url.startsWith('//') || url.startsWith('http:') || url.startsWith('https:')) {
          return callback(null, {
            statusCode,
            headers: {
              Location: url,
            },
          });
        }

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
