# pambda-redirect

[Pambda](https://github.com/pambda/pambda) to redirect.

## Installation

```
npm i pambda-redirect
```

## Usage

``` javascript
const { compose, createLambda } = require('pambda');
const { redirect } = require('pambda-redirect');

exports.handler = createLambda(
  compose(
    redirect({
      basePathMap: {
        'example.com': '/',
      },
    }),

    next => (event, context, callback) => {
      if (event.path === '/') {
        context.redirect('/frontPage');
        return;
      }

      return next(event, context, callback);
    },

    // Other pambdas
  )
);
```

## redirect(options = {})

This pambda add the `redirect` function to `context`.

- `options.basePathMap`
    - The default value for same option of `context.redirect()`.

## context.redirect([statusCode,] url[, options])

The function for specifying a redirect to be added to `context`.

Since this function calls a callback of Lambda internally, it is not necessary for the caller of this function to call the callback.

- `statusCode`
    - HTTP status code when redirecting.
    - If omitted, the default is 302.
- `url`
    - The redirect path or URL.
- `options.param`
    - A name of a query parameter that is added to the redirect URL for passing an url of a current resource.
    - If this option is `true`, `return_to` is used as a default name.
- `options.basePathMap`
    - An object for getting a base path from a custom domain.
      This object has keys representing custom domains, and values representing base paths.
    - If a custom domain not found in this object, a stage name is used as a base path.

## makeRedicrector([statusCode,] url[, options])

Generate a pambda to redirect a specified url always.

- `statusCode`
    - HTTP status code when redirecting.
    - If omitted, the default is 302.
- `url`
    - The redirect path or URL.
- `options.param`
    - A name of a query parameter that is added to the redirect URL for passing an url of a current resource.
    - If this option is `true`, `return_to` is used as a default name.
- `options.basePathMap`
    - An object for getting a base path from a custom domain.
      This object has keys representing custom domains, and values representing base paths.
    - If a custom domain not found in this object, a stage name is used as a base path.

## License

MIT
