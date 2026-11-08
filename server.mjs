import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const port = Number(
  process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] || 4173,
);
const root = process.argv.includes("--dist")
  ? path.join(process.cwd(), "dist")
  : process.cwd();
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400).end();
      return;
    }
    let file = path.resolve(root, "." + pathname);
    if (
      (file !== root && !file.startsWith(root + path.sep)) ||
      pathname.includes("/.")
    ) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { Location: pathname + "/" }).end();
        return;
      }
      file = path.join(file, "index.html");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
        return;
      }
      const headers = {
        "Content-Type": types[path.extname(file)] || "text/plain",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      };
      if (
        [
          ".html",
          ".js",
          ".css",
          ".txt",
          ".xml",
          ".json",
          ".webmanifest",
        ].includes(path.extname(file))
      )
        headers["Content-Type"] += "; charset=utf-8";
      res.writeHead(200, headers);
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`CopyHex: http://127.0.0.1:${port}`),
  );
