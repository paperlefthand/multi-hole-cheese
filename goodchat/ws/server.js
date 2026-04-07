"use strict";
const server = require("ws").Server;
const PORT = process.env.PORT || 5000;
const s = new server({
  port: PORT,
  clientTracking: true,
});

const MAX_MESSAGE_LENGTH = 1000;

s.on("connection", (ws) => {
  console.log("Connected.");
  ws.on("message", (msg) => {
    const msgStr = msg.toString();
    if (msgStr === "ping") return;
    if (msgStr.length > MAX_MESSAGE_LENGTH) return;
    s.clients.forEach((client) => {
      client.send(msgStr);
    });
  });
  ws.on("close", () => {
    console.log("Closed.");
  });
});
