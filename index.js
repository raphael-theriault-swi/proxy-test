const http = require("node:http");
const why = require("why-is-node-running");

switch (process.argv[2]) {
  case "new": {
    require("solarwinds-apm-new").waitUntilAgentReady(10_000);
    break;
  }
  case "old": {
    require("solarwinds-apm-old").readyToSample(10_000);
    break;
  }
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("Hello, World!");
});
server.listen(0, "localhost");

server.on("listening", () => {
  const { address, port, family } = server.address();
  const target =
    family === "IPv6"
      ? `http://[${address}]:${port}`
      : `http://${address}:${port}`;

  const get = () =>
    new Promise((res, rej) => {
      let data = "";
      const req = http.get(target, (r) =>
        r
          .setEncoding("utf-8")
          .on("data", (chunk) => (data += chunk))
          .on("end", () => {
            console.log(data);
            res();
          })
      );
      req.on("error", rej);
    });

  const reqs = [];
  for (let i = 0; i < 10; i++) {
    reqs.push(get());
  }
  Promise.all(reqs).then(() => server.close(() => why()));
});
