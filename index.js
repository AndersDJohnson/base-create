const fs = require('fs')
const { spawnSync } = require('child_process')

const runCommand = (command) => {
  console.log(command)

  const split = command.split(' ');

  const name = split.shift();
  
  spawnSync(name, split, {
    stdio: 'inherit'
  })
}

const create = (name, options) => {
  const { dependencies, devDependencies, package } = options;
  
  const appDir = process.argv[2];

  if (!appDir) {
    console.log('Must provide directory as argument: `npm init ' + node + ' my-app`.')
    process.exit(1)
  }

  fs.mkdirSync(appDir)

  process.chdir(appDir)

  runCommand('npm init -y')

  if (devDependencies) {
    runCommand('npm add -D ' + devDependencies.join(' '))
  }

  if (dependencies) {
    runCommand('npm add ' + dependencies.join(' '))
  }

  fs.writeFileSync('.gitignore', `
# Created by https://www.toptal.com/developers/gitignore/api/node
# Edit at https://www.toptal.com/developers/gitignore?templates=node

### Node ###
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# End of https://www.toptal.com/developers/gitignore/api/node
`)

  const cwd = process.cwd()

  const pkg = require(`${cwd}/package.json`)

  pkg.scripts = {
    ...pkg.scripts,
    ...package.scripts
  }

  Object.entries(package, ([key, value]) => {
    pkg[key] = value;
  })

  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

  return { name: appDir };
}

exports.default = create;
exports.create = create;
module.exports = create;
