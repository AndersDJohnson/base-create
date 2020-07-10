# base-create

> Utility for npm init create-* scripts.

Example for a script called `create-custom-babel`
(run with `npm init custom-babel my-app`), you could do:

```js
#!/usr/bin/env node

const create = require('base-create')

// `name` will be the app name passed on CLI like "my-app"
const { name } = create('custom-babel', {
  dependencies: ["@babel/runtime"],
  devDependencies: [
    "@babel/core",
    "@babel/plugin-transform-runtime",A
  ],
  // Mostly a shallow merge into a base `package.json` from `npm init`.
  package: {
    main: "dist/main.js",
    // These will merge with scripts like `test` from `npm init`.
    scripts: {
      build: "babel src --out-dir dist",
      "build:watch": "npm run build -- --watch",
    },
  },
  files: [
    'src/index.js',
    {
      path: 'src/hello.js',
      contents: 'alert("hi")'
    }
  ]
})

// now you can create folders & files with `fs.mkdirSync` & `fs.writeFileSync`, etc.
```
