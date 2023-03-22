<?php
require_once "connect-user.php";
require_once "functions.php";

session_start();

if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: gochat.php");
    exit;
}

$datas = [
    'name' => '',
    'password' => '',
    // 'confirm_password' => ''
];
$login_err = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {

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
            
            // if (password_verify($datas['password'], $row['password'])) {
            if ($datas['password'] == $row['password']) {
                
                session_regenerate_id(true);
                
                $_SESSION["loggedin"] = true;
                $_SESSION["id"] = $row['id'];
                $_SESSION["name"] = $row['name'];
                
                // header("location:gochat.php");
                header("location:gochat.php?name=" . $_SESSION["name"]);
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
        echo '<div class="alert alert-danger">' . $login_err . '</div>';
    }
    ?>

    <form action="<?php echo $_SERVER['SCRIPT_NAME']; ?>" method="post">

        <div class="form-group">
        <label>ユーザ名</label>
        <input type="text" name="name" class="<?php echo (!empty($errors['name'])) ? 'is-invalid' : ''; ?>"
            value="<?php echo $datas['name']; ?>">
        <span class="invalid-feedback">
            <?php echo $errors['name']; ?>
        </span>

        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" name="password"
                class="<?php echo (!empty($errors['password'])) ? 'is-invalid' : ''; ?>"
                value="<?php echo $datas['password']; ?>">
            <span class="invalid-feedback">
                <?php echo $errors['password']; ?>
            </span>
        </div>

        <div>
            <input type="submit" class="btn btn-primary" value="ログイン">
        </div>
        <!-- <p>Don't have an account? <a href="register.php">Sign up now</a></p> -->
    </form>
    </div>
</body>

</html>