# music2dmx

音楽の強弱を分析し、それに合った DMX 照明を自動で選択して Art-Net で送信するサンプル。

UE5.1.1 の DMX サンプルプロジェクトで動作確認しています。

# Usage

実行

```
docker-compose up
```

localhost:5173 で WebUI が起動します。照明効果を Unreal Engine に反映させるには、ArtNet が受信可能な状態で UE を起動しておく必要があります。

# Options

環境変数で ArtNet の IP とポート番号を指定可能。

localhost に送信する場合は、host.docker.internal を指定してください。

docker-compose.yml

```
~
environment:
  - ARTNET_IP=host.docker.internal
  - ARTNET_PORT=6454
~
```
