# music2dmx

音楽の強弱を分析し、それに合った DMX 照明を自動で選択して Art-Net で送信するサンプル。

UE5.1.1 の DMX サンプルプロジェクトで動作確認しています。

# Usage

実行

```
docker-compose up
```

localhost:5173 で WebUI が起動します。

# Options

環境変数で ArtNet の IP とポート番号を指定可能。

docker-compose.yml

```
~
environment:
  - ARTNET_IP=localhost
  - ARTNET_PORT=6454
~
```
