# pambda-redirect

[Pambda](https://github.com/pambda/pambda) to redirect.

## Installation

```
npm i pambda-redirect -S
```

## Usage

``` javascript
const { compose, createLambda } = require('pambda');
const { redirect } = require('pambda-redirect');

exports.handler = createLambda(
  compose(
    redirect(),

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

- `options`
    - Reserved.

## context.redirect([statusCode,] url)

The function for specifying a redirect to be added to `context`.

Since this function calls a callback of Lambda internally, it is not necessary for the caller of this function to call the callback.

- `statusCode`
    - HTTP status code when redirecting.
    - If omitted, the default is 302.
- `url`
    - The redirect path or URL.

## License

MIT
