# base-create

> Utility for npm init create-\* scripts.

Note: If you're creating an initializer for monorepos, try [`base-create-monorepo`](https://npm.im/base-create-monorepo).

Example for a script called `create-custom-babel`
(run with `npm init custom-babel my-app`), you could do:

```js
#!/usr/bin/env node

const create = require("base-create");

// `name` will be the app name passed on CLI like "my-app"
const { name } = create({
  // optional deps to install
  dependencies: ["@babel/runtime"],
  // optional dev deps to install
  devDependencies: ["@babel/core", "@babel/plugin-transform-runtime", A],
  // mostly a shallow merge into a base `package.json` from `npm init`
  package: {
    main: "dist/main.js",
    // these will merge with scripts like `test` from `npm init`
    scripts: {
      build: "babel src --out-dir dist",
      "build:watch": "npm run build -- --watch",
    },
  },
  // optional files to create
  files: [
    "src/index.js",
    {
      path: "src/hello.js",
      contents: 'alert("hi")',
    },
    {
      path: "README.md",
      // `contents` can be a function
      contents: ({ nameWithScope, nameWithoutScope, dirName }) =>
        "# ${nameWithScope}",
    },
  ],
  // optional list of commands
  commands: [],
  // optional global config options
  config: {
    // optional package scope to for main package and any sub-packages for monorepos
    scope: "@my-org",
  },
  // optionally skip default gitignore creation
  skipGitignore: false,
  // optionally skip default readme creation
  skipReadme: false,
  // optionally specify sub-packages for monorepos - see the `base-create-monorepo` package to ease this
  packages: [
    {
      name: "my-first-subpackage",
      package: {
        scripts: {
          start: "node dist/first.js",
        },
        files: ["src/first.js"],
      },
      // ...supports most of the root-level options
    },
    {
      name: "my-second-subpackage",
      package: {
        scripts: {
          start: "node dist/second.js",
        },
        files: ["src/second.js"],
      },
      // ...supports most of the root-level options
    },
    // ...and more sub-packages if you want
  ],
});
```
