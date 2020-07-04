# base-create

> Utility for npm init create-* scripts.

For a script called `create-babel`, run with `npm init babel my-app`, you could do:

```js
const create = require('base-create')

create('babel', {
  dependencies: ['@babel/runtime'],
  devDependencies: ["@babel/core", "@babel/cli", "@babel/node", "@babel/preset-env", "@babel/plugin-transform-runtime"],
})
```

