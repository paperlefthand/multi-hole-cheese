const chat = document.getElementById("chat");

const addMyMessage = (message) => {
  const text = document.createElement("p");
  text.className = "message-text p-2 me-2 mb-0 bg-success text-white";
  text.textContent = message;
  const elm = document.createElement("div");
  elm.className = "message d-flex flex-row-reverse align-items-start mb-2";
  elm.appendChild(text);

  chat.appendChild(elm);
};

const addYourMessage = (name, message) => {
  const icon = document.createElement("img");
  icon.src = `${name}.png`;
  icon.className = "message-icon rounded-circle border border-dark";
  const text = document.createElement("p");
  text.className = "message-text p-2 ms-2 mb-0 bg-dark text-white";
  text.textContent = message;
  const elm = document.createElement("div");
  elm.className = "message d-flex flex-row align-items-start mb-2";
  elm.appendChild(icon);
  elm.appendChild(text);

  chat.appendChild(elm);
};

// const out = document.getElementById("out");
const msg = document.getElementById("msg");
const btn = document.getElementById("btn");
const user_name = document.getElementById("name").textContent.trim();

// websocket client側の設定
const sock = new WebSocket("ws://badchat.ws.example.com/");
// const sock = new WebSocket("ws://127.0.0.1:5000/");
sock.addEventListener("message", (e) => {
  if (e.data !== "ping") {
    // const data = e.data.split(":").map((s) => s.trim());
    const data = e.data.split(":");
    if (data[0] === user_name) {
      addMyMessage(data[1]);
    } else {
      addYourMessage(...data);
    }
    msg.value = "";
    msg.focus();
  }
});
sock.addEventListener("open", (e) => {
  console.log("Connected.");
});
sock.addEventListener("close", (e) => {
  console.log("Closed.");
  location.href = "/logout.php";
});
sock.addEventListener("error", (e) => {
  console.log("Error.");
});

// 送信ボタン
btn.addEventListener("click", (e) => {
  sock.send(`${user_name}:${msg.value}`);
});

// ping(nginxのtimeout対策)
setInterval(() => {
  sock.send("ping");
}, 30 * 1000); // ms

msg.focus();
