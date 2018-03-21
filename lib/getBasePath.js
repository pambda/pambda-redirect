const { get } = require('caseless-get');

const EXECUTE_API_DOMAIN = `execute-api.${process.env.AWS_REGION}.amazonaws.com`;

const isFromCustomDomain = (event) => {
  const host = get(event.headers, 'Host');
  return !host.endsWith(EXECUTE_API_DOMAIN);
};

const getBasePath = (event) => {
  if (isFromCustomDomain(event)) {
    return '/';
  } else {
    const { stage } = event.requestContext;
    return `/${stage}/`;
  }
};

exports.getBasePath = getBasePath;
