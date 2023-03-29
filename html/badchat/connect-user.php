<?php
$dsn = 'mysql:dbname=badchat;host=badchat-db';
$user = 'user1';
$password = 'password1';

try {
    $pdo = new PDO($dsn, $user, $password);
} catch (PDOException $e) {
    print('Error:' . $e->getMessage());
    die();
}

?>