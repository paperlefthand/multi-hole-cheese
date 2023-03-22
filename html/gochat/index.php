<?php
session_start();
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>gochat</title>
</head>

<body>
  ようこそ <span id="name">
    <?php 
    // echo $_SESSION['name']; 
    echo $_GET['name']; 
    ?>
  </span> さん
  <div id="out"></div>
  <input type="text" id="msg" />
  <input type="button" id="btn" value="OK" />
  <script>
    const out = document.getElementById("out");
    const msg = document.getElementById("msg");
    const btn = document.getElementById("btn");
    const user_name = document.getElementById("name").textContent;
    const sock = new WebSocket("ws://127.0.0.1:5000/");
    sock.addEventListener("open", (e) => {
      console.log("Connected.");
    });
    sock.addEventListener("close", (e) => {
      console.log("Closed.");
    });
    sock.addEventListener("error", (e) => {
      console.log("Error.");
    });
    sock.addEventListener("message", (e) => {
      out.innerText += `${e.data}`;
      msg.value = "";
      msg.focus();
    });
    btn.addEventListener("click", (e) => {
      sock.send(`${user_name}: ${msg.value}`);
    });
    msg.focus();
  </script>
</body>

</html>