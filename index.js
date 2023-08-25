const http = require("node:http");

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("Hello, World!");
});
server.listen(0);

server.on("listening", () => {
  const { address, port, family } = server.address();
  const target =
    family === "IPv6"
      ? `http://[${address}]:${port}`
      : `http://${address}:${port}`;

  const get = () =>
    new Promise((res, rej) => {
      let data = "";
      http
        .get(target, (r) =>
          r
            .setEncoding("utf-8")
            .on("data", (chunk) => (data += chunk))
            .on("end", () => {
              console.log(data);
              res();
            })
        )
        .on("error", rej);
    });

  const reqs = [];
  for (let i = 0; i < 10; i++) {
    reqs.push(get());
  }
  Promise.all(reqs).then(() => server.close());
});
