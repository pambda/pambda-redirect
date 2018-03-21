# pambda-redirect

リダイレクトを行うための [Pambda](https://github.com/pambda/pambda).

## Installation

```
npm i pambda-redirect -S
```

## Usage

``` javascript
const { compose, createLambda } = require('pambda');
const { redirect } = require('pambda-redirect');

export const handler = createLambda(
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

`context` にリダイレクトするための関数を追加する。

- `options`
    - 予約。

## context.redirect([statusCode,] url)

`context` に追加されるリダイレクトを指定するための関数。

この関数は、内部で Lambda の callback を呼ぶため、呼び出し側で callback を呼び出す必要はない。

- `statusCode`
    - リダイレクトする際の HTTP ステータスコード。
    - 省略した場合、デフォルトは 302 になる。
- `url`
    - リダイレクト先のパス、または URL.

## License

MIT
