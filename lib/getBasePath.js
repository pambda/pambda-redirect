const { get } = require('caseless-get');

const getBasePath = (event, options = {}) => {
  const {
    basePathMap = {},
  } = options;

  const host = get(event.headers, 'host');
  let basePath;

  if (host && (basePath = basePathMap[host])) {
    return basePath.endsWith('/') ? basePath : basePath + '/';
  } else {
    return `/${event.requestContext.stage}/`;
  }
};

exports.getBasePath = getBasePath;
