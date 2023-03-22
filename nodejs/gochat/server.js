"use strict";
const server = require("ws").Server;
const PORT = process.env.PORT || 5000;
const s = new server({ port: PORT });
s.on("connection", (ws) => {
  ws.on("message", (msg) => {
    console.log("Recv: " + msg);
    s.clients.forEach((client) => {
      console.log("Send: " + msg);
      client.send(msg.toString());
    });
  });
  ws.on("close", () => {
    console.log("Closed.");
  });
});
