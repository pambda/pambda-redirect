const { error } = require('lambda-console');
const { join } = require('path');
const { getBasePath } = require('./getBasePath');
const { callbackify } = require('lambda-callbackify');
const { get } = require('caseless-get');

const makeRedirector = (statusCode, url, options) => {
  if (typeof statusCode !== 'number') {
    [statusCode, url, options] = [302, statusCode, url];
  }

  return next => (event, context, callback) => {
    if (options) {
      url = makeUrlWithReturnTo(url, options, event);
    }

    /*
     * Add a base path when a relative path is specified.
     */
    if (!url.startsWith('//') && !url.startsWith('http:') && !url.startsWith('https:')) {
      url = join(getBasePath(event, options), url);
    }

    /*
     * Redirect.
     */
    callback(null, {
      statusCode,
      headers: {
        Location: url,
      },
    });
  };
};

const redirect = (options = {}) => {
  const { basePathMap } = options;

  return next => {
    next = callbackify(next);

    return (event, context, callback) => {
      const redirectContext = {
        done: false,
      };

      context.redirect = (statusCode, url, options) => {
        /*
         * Record that the redirect is called.
         */
        redirectContext.done = true;

        if (typeof statusCode !== 'number') {
          [statusCode, url, options] = [302, statusCode, url];
        }

        if (basePathMap) {
          options === undefined && (options = {});
          options.basePathMap === undefined && (options.basePathMap = basePathMap);
        }

        makeRedirector(statusCode, url, options)()(event, context, callback);
      };

      /*
       * Redirect '/base' to '/base/'.
       */
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
exports.makeRedirector = makeRedirector;
exports.redirect = redirect;
