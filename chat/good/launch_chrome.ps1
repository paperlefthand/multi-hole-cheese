# ハンズオン用の Chrome を 2 つ (Alice 用 / Bob 用) 別プロファイルで起動する。
# --host-resolver-rules で *.example.com を 127.0.0.1 に向けるので、Windows の hosts ファイル編集は不要。
# (この設定は、ここで起動した Chrome にだけ効く)
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$url = 'http://goodchat.example.com:8101/'
$common = @('--host-resolver-rules="MAP *.example.com 127.0.0.1"', '--window-size="800,960"')

Start-Process -FilePath $chrome -ArgumentList (@('--user-data-dir=C:\temp\data1') + $common + $url)
Start-Process -FilePath $chrome -ArgumentList (@('--user-data-dir=C:\temp\data2') + $common + $url)
