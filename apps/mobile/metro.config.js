const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Support du monorepo pnpm : Metro doit surveiller la racine du workspace
// (pour voir packages/shared) et suivre les symlinks pnpm.
config.watchFolders = [workspaceRoot];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
