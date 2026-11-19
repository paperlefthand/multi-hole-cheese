<?php
session_start();
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
  header("location: login.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="utf-8">
  <title>badchat</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous" />

  <link rel="stylesheet" href="style.css" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>

<body>

  <div class="container ">

    <!-- タイトル -->
    <div class="row p-2">
      <div class="col-fluid h1"><span id="name">
          <?php
          // echo $_SESSION['name']; 
          echo $_GET['name'];
          ?>
        </span> さんのチャットルーム</div>
    </div>

    <!-- チャットエリア -->
    <div id="chat" class="bg-light p-2">
    </div>

    <!-- 送信フォーム -->
    <div class="row p-4 input-group">
      <div class="col-9">
        <input class="form-control" type="text" placeholder="メッセージを入力" id="msg" />
      </div>
      <div class="col-3">
        <button class="btn btn-primary" type="submit" id="btn">送信</button>
      </div>
    </div>

    <script src="index.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4"
      crossorigin="anonymous"></script>
</body>


</html>