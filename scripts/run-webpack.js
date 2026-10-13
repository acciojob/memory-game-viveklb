const { spawnSync } = require("child_process");

const commands = {
  build: {
    executable: "webpack/bin/webpack",
    args: ["--mode", "production"],
  },
};

const command = commands[process.argv[2]];
if (!command) {
  console.error("Usage: node scripts/run-webpack.js build");
  process.exit(1);
}

const env = { ...process.env };
if (Number(process.versions.node.split(".")[0]) >= 17) {
  env.NODE_OPTIONS = [env.NODE_OPTIONS, "--openssl-legacy-provider"]
    .filter(Boolean)
    .join(" ");
}

const result = spawnSync(
  process.execPath,
  [require.resolve(command.executable), ...command.args],
  { env, stdio: "inherit" }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
