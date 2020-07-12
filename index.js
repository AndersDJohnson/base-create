const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const mkdirp = require("mkdirp");

const runCommand = (command) => {
  console.log(command);

  const split = command.split(" ");

  const name = split.shift();

  spawnSync(name, split, {
    stdio: "inherit",
  });
};

const addScopeToPackageName = (scope, packageName) =>
  `@${scope.replace(/^@/, "")}/${packageName}`;

const createFiles = (files) => {
  if (!files) return;

  files.forEach((file) => {
    // Following `vinyl` file schema.
    const filepath = typeof file === "string" ? file : file.path;
    const contents =
      typeof file === "string"
        ? ""
        : typeof file.contents === "string"
        ? file.contents
        : JSON.stringify(file.contents, undefined, 2);
    mkdirp.sync(path.dirname(filepath));
    fs.writeFileSync(filepath, contents);
  });
};

const createPackage = (name, options) => {
  const {
    config = {},
    isSubPackage,
    skipInstall,
    commands,
    dependencies,
    devDependencies,
    package,
    packages,
    files,
  } = options;

  const { scope } = config;

  const cwd = process.cwd();

  let appDir = process.argv[2];

  if (!appDir) {
    console.log(
      "Must provide directory as argument: `npm init " + node + " my-app`."
    );
    process.exit(1);
  }

  if (isSubPackage) {
    appDir = `${appDir}/packages/${name}`;
  }

  const appCwd = path.join(cwd, appDir);

  mkdirp.sync(appDir);

  process.chdir(appDir);

  // Create files first so they can start working even while commands are still running.
  if (!isSubPackage) {
    createFiles(files);
  }

  if (packages) {
    packages.forEach((package) => {
      const packageDir = `packages/${package.name}`;

      mkdirp.sync(packageDir);

      process.chdir(packageDir);

      createFiles(package.files);

      process.chdir(appCwd);
    });
  }

  runCommand("npm init -y");

  if (!skipInstall) {
    if (devDependencies) {
      runCommand("npm add -D " + devDependencies.join(" "));
    }

    if (dependencies) {
      runCommand("npm add " + dependencies.join(" "));
    }
  }

  fs.writeFileSync(
    ".gitignore",
    fs.readFileSync(`${__dirname}/files/gitignore`)
  );

  const newPackage = require(`${appCwd}/package.json`);

  newPackage.scripts = {
    ...newPackage.scripts,
    ...package.scripts,
  };

  if (package) {
    Object.entries(package).forEach(([key, value]) => {
      newPackage[key] = value;
    });
  }

  if (scope) {
    newPackage.name = addScopeToPackageName(scope, newPackage.name);
  }

  fs.writeFileSync("package.json", JSON.stringify(newPackage, null, 2));

  if (commands) {
    commands.forEach((command) => runCommand(command));
  }

  process.chdir(cwd);

  return { name: appDir };
};

const create = (name, options) => {
  const { config, packages } = options;

  const result = createPackage(name, options);

  if (packages) {
    packages.forEach((package) => {
      createPackage(package.name, {
        isSubPackage: true,
        config,
        ...package,
      });
    });
  }

  return result;
};

exports.default = create;
exports.create = create;
module.exports = create;
