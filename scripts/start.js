const { spawnSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const build = spawnSync(
  process.execPath,
  [path.join(__dirname, "run-webpack.js"), "build"],
  { stdio: "inherit" }
);

if (build.error) {
  console.error(build.error);
  process.exit(1);
}
if (build.status !== 0) {
  process.exit(build.status === null ? 1 : build.status);
}

const outputDirectory = path.resolve(__dirname, "../dist");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

http
  .createServer((request, response) => {
    let pathname;
    try {
      pathname = new URL(request.url, "http://localhost").pathname;
      pathname = decodeURIComponent(pathname);
    } catch (error) {
      response.writeHead(400);
      response.end("Invalid request path");
      return;
    }

    const relativePath = pathname === "/" ? "index.html" : `.${pathname}`;
    const filePath = path.resolve(outputDirectory, relativePath);
    if (!filePath.startsWith(`${outputDirectory}${path.sep}`)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, contents) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      });
      response.end(contents);
    });
  })
  .listen(8080, "0.0.0.0", () => {
    console.log("Memory Game is running at http://localhost:8080");
  });
