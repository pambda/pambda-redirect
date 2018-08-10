const { get } = require('caseless-get');

const getBasePath = (event, options = {}) => {
  const {
    basePathMap = {},
  } = options;

  const host = get(event.headers, 'host') || '';
  const basePath = basePathMap[host];

  if (basePath) {
    return basePath.endsWith('/') ? basePath : basePath + '/';
  } else if (host.endsWith('.amazonaws.com')) {
    return `/${event.requestContext.stage}/`;
  } else {
    return '/';
  }
};

exports.getBasePath = getBasePath;
