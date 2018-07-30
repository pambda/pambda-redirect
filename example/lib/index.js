const { compose, createLambda } = require('pambda');
const { errorhandler } = require('pambda-errorhandler');
const { render404 } = require('pambda-404');
const { binarySupport } = require('pambda-binary-support');
const { serveStatic } = require('pambda-serve-static');
const { combineByPath } = require('pambda-path');
const { redirect } = require('pambda-redirect');

const LOCAL = process.env.AWS_SAM_LOCAL === 'true';

exports.handler = createLambda(
  compose(
    errorhandler(),

    redirect(),

    combineByPath({
      '/redirect1': next => (event, context, callback) => {
        context.redirect('/');
      },
    }),

    binarySupport({
      binaryMediaTypes: [ 'image/*' ],
    }),

    serveStatic('public', {
      basePath: '/',
      index: [ 'index.htm', 'index.html' ],
    }),

    render404()
  )
);
