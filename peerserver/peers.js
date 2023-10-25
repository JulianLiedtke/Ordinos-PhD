console.log("Starting Peer Broker");

var fs = require("fs");
var PeerServer = require("peer").PeerServer;
var server = PeerServer({
  port: 9000,
  ssl: {
    key: fs.readFileSync(
      "../certificate_localhost/key.pem"
    ),
    cert: fs.readFileSync(
      "../certificate_localhost/cert.pem"
    ),
    ca: fs.readFileSync(
      "../certificate_localhost/cert.pem"
    ),
  },
  path: "/",
});

console.log("Ready");

server.on("connection", (client) => {
  console.log(time() + " Client connect: " + client.id);
});

server.on("disconnect", (client) => {
  console.log(time() + " Client disconnect: " + client.id);
});

function time() {
  return new Date().toISOString();
}
