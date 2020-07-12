const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const mkdirp = require("mkdirp");
const chalk = require("chalk");

const startCwd = process.cwd();

const getRelativeCwd = () => path.relative(startCwd, process.cwd());

const runCommand = (command) => {
  console.log(
    chalk.green.bold(`Command (in "${getRelativeCwd()}"):`),
    chalk.cyan(command)
  );

  const split = command.split(" ");

  const name = split.shift();

  spawnSync(name, split, {
    stdio: "inherit",
  });
};

const addScopeToPackageName = (scope, packageName) =>
  `@${scope.replace(/^@/, "")}/${packageName}`;

const normalizeFile = (file, params) => {
  // Following `vinyl` file schema.
  const filepath = typeof file === "string" ? file : file.path;

  let contents = typeof file === "string" ? "" : file.contents;
  contents = typeof contents === "function" ? contents(params) : contents;
  contents =
    typeof contents === "string"
      ? contents
      : JSON.stringify(contents, undefined, 2);

  return {
    path: filepath,
    contents,
  };
};

const createFile = (file, params) => {
  const { path: filepath, contents } = normalizeFile(file, params);

  console.log(
    chalk.green.bold("Creating file:"),
    chalk.cyan(path.join(getRelativeCwd(), filepath))
  );

  mkdirp.sync(path.dirname(filepath));
  fs.writeFileSync(filepath, contents, "utf8");
};

const createFiles = (files, { options, params }) => {
  const { skipGitignore, skipReadme } = options;

  const normalizedFiles =
    files && files.map((file) => normalizeFile(file, params));

  if (!skipGitignore) {
    createFile(
      {
        path: ".gitignore",
        contents: fs.readFileSync(`${__dirname}/files/gitignore`, "utf8"),
      },
      params
    );
  }

  const hasReadmeFile =
    normalizedFiles &&
    normalizedFiles.find((file) => file.path === "README.md");

  if (!hasReadmeFile && !skipReadme) {
    createFile(
      {
        path: "README.md",
        contents: `# ${params.nameWithScope}\n\n`,
      },
      params
    );
  }

  if (!files) return;

  files.forEach((file) => createFile(file, params));
};

const makeCreateFileParams = (options) => {
  const { scope, name } = options;

  const nameWithScope = scope ? addScopeToPackageName(scope, name) : name;

  const nameWithoutScope = name.replace(/^@.*\//, "");

  const dirName = nameWithoutScope;

  const createFileParams = {
    nameWithScope,
    nameWithoutScope,
    dirName,
  };

  return createFileParams;
};

const createPackage = (options) => {
  const {
    isSubPackage,
    skipInstall,
    commands,
    dependencies,
    devDependencies,
    package = {},
    packages,
    files,
  } = options;

  const cwd = process.cwd();

  // Follow the `@types/scope__name` convention for replacing `/`.
  let packageDir = process.argv[2].replace(/\//g, "__");

  options.name = options.name || packageDir;

  const createFileParams = makeCreateFileParams(options);

  const { nameWithScope, dirName } = createFileParams;

  if (!packageDir) {
    console.log(
      "Must provide directory as argument: `npm init " + node + " my-app`."
    );
    process.exit(1);
  }

  if (isSubPackage) {
    packageDir = `${packageDir}/packages/${dirName}`;
  }

  const appCwd = path.join(cwd, packageDir);

  if (!isSubPackage && fs.existsSync(packageDir)) {
    console.error(
      chalk.red(
        `Directory "${packageDir}" already exists. Please only create projects in a new directory.`
      )
    );
    process.exit(1);
  }

  console.log(
    chalk.green.bold(
      `Creating ${isSubPackage ? "sub-package" : "project"} directory:`
    ),
    chalk.cyan(path.join(getRelativeCwd(), packageDir))
  );

  mkdirp.sync(packageDir);

  process.chdir(packageDir);

  // Create files first so they can start working even while commands are still running.
  if (!isSubPackage) {
    createFiles(files, { options, params: createFileParams });
  }

  if (packages) {
    packages.forEach((package) => {
      const packageDir = `packages/${package.name}`;

      mkdirp.sync(packageDir);

      process.chdir(packageDir);

      const subPackage = {
        ...package,
        isSubPackage: true,
      };

      createFiles(package.files, {
        options: subPackage,
        params: makeCreateFileParams(subPackage),
      });

      process.chdir(appCwd);
    });
  }

  runCommand("npm init -y");

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

  newPackage.name = nameWithScope;

  createFile({ path: "package.json", contents: newPackage }, createFileParams);

  if (!skipInstall) {
    if (devDependencies) {
      runCommand("npm add -D " + devDependencies.join(" "));
    }

    if (dependencies) {
      runCommand("npm add " + dependencies.join(" "));
    }
  }

  if (commands) {
    commands.forEach((command) => runCommand(command));
  }

  process.chdir(cwd);

  return { name: packageDir, packageDir };
};

const create = (options) => {
  const { packages } = options;

  const result = createPackage(options);

  if (packages) {
    packages.forEach((package) => {
      createPackage({
        ...package,
        isSubPackage: true,
      });
    });
  }

  console.log(
    chalk.green.bold(
      `Done! You can now \`cd ${result.packageDir}\` to start working on your project.`
    )
  );

  return result;
};

exports.default = create;
exports.create = create;
module.exports = create;
