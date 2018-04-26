const getBasePath = (event) => {
  const deleteLength = event.path.length - 1;
  const { path: reqPath } = event.requestContext;

  if (deleteLength === 0) {
    return reqPath.endsWith('/') ? reqPath : reqPath + '/';
  }

  return reqPath.substr(0, reqPath.length - deleteLength);
};

exports.getBasePath = getBasePath;
