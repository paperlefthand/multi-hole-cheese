<?php
require_once "connect-user.php";
require_once "functions.php";

session_start();

if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: index.php");
    exit;
}

$datas = [
    'name' => '',
    'password' => '',
];
$login_err = "";

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    setToken();
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {

    checkToken();

    foreach ($datas as $key => $value) {
        if ($value = filter_input(INPUT_POST, $key, FILTER_DEFAULT)) {
            $datas[$key] = $value;
        }
    }

    $errors = validation($datas, false);
    if (empty($errors)) {

        $sql = "SELECT id,name,password FROM users WHERE name = :name";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':name', $datas['name'], PDO::PARAM_STR);
        $stmt->execute();

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

            if (password_verify($datas['password'], $row['password'])) {

                session_regenerate_id(true);

                $_SESSION["loggedin"] = true;
                $_SESSION["id"] = $row['id'];
                $_SESSION["name"] = $row['name'];

                header("location:index.php");
                exit();
            } else {
                $login_err = 'Invalid username or password.';
            }
        } else {
            $login_err = 'Invalid username or password.';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <title>Login</title>

</head>

<body>
    <h2>チャットルームへログイン</h2>
    <p>ユーザIDとパスワードを入力してください</p>

    <?php
    if (!empty($login_err)) {
        echo '<div class="alert alert-danger">' . htmlspecialchars($login_err, ENT_QUOTES, 'UTF-8') . '</div>';
    }
    ?>

    <form action="<?php echo htmlspecialchars($_SERVER['SCRIPT_NAME'], ENT_QUOTES, 'UTF-8'); ?>" method="post">

        <input type="hidden" name="token" value="<?php echo htmlspecialchars($_SESSION['token'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">

        <div class="form-group">
            <label>ユーザ名</label>
            <input type="text" name="name" class="<?php echo (!empty($errors['name'])) ? 'is-invalid' : ''; ?>"
                value="<?php echo htmlspecialchars($datas['name'], ENT_QUOTES, 'UTF-8'); ?>">
            <span class="invalid-feedback">
                <?php echo htmlspecialchars($errors['name'] ?? '', ENT_QUOTES, 'UTF-8'); ?>
            </span>

        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" name="password"
                class="<?php echo (!empty($errors['password'])) ? 'is-invalid' : ''; ?>"
                value="">
            <span class="invalid-feedback">
                <?php echo htmlspecialchars($errors['password'] ?? '', ENT_QUOTES, 'UTF-8'); ?>
            </span>
        </div>

        <div>
            <input type="submit" class="btn btn-primary" value="ログイン">
        </div>
    </form>
    </div>
</body>

</html>
