import librosa
import librosa.display
import numpy as np
import json

#音声ファイルをロード
y, sr = librosa.load("./python/music/mirage_voyage.wav")
tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)

#特徴量算出用のパラメタ
frame_length = 65536 #特徴量を１つ算出するのに使うサンプル数
hop_length   = 16384 #何サンプルずらして特徴量を算出するかを決める変数

#RMS：短時間ごとのエネルギーの大きさを算出
rms   = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
rms   /= np.max(rms)

#スペクトル重心：短時間ごとの音色の煌びやかさを算出
sc    = librosa.feature.spectral_centroid(y=y, n_fft=frame_length, hop_length=hop_length)[0]
sc    /= np.max(sc)

#最大値探索で無視する,先頭と末尾のデータ数を指定
n_ignore = 10 

indices = np.argsort((sc+rms)[n_ignore:-n_ignore])[::-1] + n_ignore

times = np.floor(librosa.times_like(sc, hop_length=hop_length, sr=sr))

#推定サビ時刻（秒）を算出
chorus_estimated_time = times[indices[0]]

#RMSの閾値を設定してセクションを判別
big_threshold = 0.83
mid_threshold = 0.71

#音量から照明効果の大/中/小を区分
def get_section_label(value):
    if value > big_threshold:
        return "big"
    elif value > mid_threshold:
        return "mid"
    else:
        return "low"

#セクションごとのラベルを割り当て（大、中、小）
section_labels = [get_section_label(value) for value in rms]

min_section_length = 4   #最小セクションの長さ（フレーム数）
label_buffer = []
last_created = 0

sections = []
jsonData = {"bpm":tempo[0],"sections":sections}

#セクションの作成
def create_section(start, end, label):
    print(f"created:{label}")
    start_minutes = int(start // 60)
    start_seconds = int(start % 60)
    end_minutes = int(end // 60)
    end_seconds = int(end % 60)
    section = {
        "start": f"{start_minutes}:{start_seconds:02d}",
        "end": f"{end_minutes}:{end_seconds:02d}",
        "level": label
    }
    sections.append(section)

#セクションのラベルと対応する時間を処理
for i, (time, label) in enumerate(zip(times, section_labels)):
    #ラベルをバッファに保存
    label_buffer.append(label)

    #ラベルが変わった時
    if i > 0 and section_labels[i - 1] != label:
        if(time > chorus_estimated_time and (section_labels[i - 1] == "big" or  section_labels[i - 1] == "mid")):
            create_section(last_created, times[i - 1], "big_chorus")
            last_created = times[i - 1]

        elif len(label_buffer) >= min_section_length:
            create_section(last_created, times[i - 1], section_labels[i - 1])
            last_created = times[i - 1]

        label_buffer = []  #バッファをリセット
    
#最後に残ったセクションを処理
if label_buffer:
    create_section(last_created, times[-1], section_labels[-1])

#JSON形式で出力
json_output = json.dumps(jsonData, ensure_ascii=False, indent=2)

#JSONファイルに保存
with open('./python/music_sections.json', 'w', encoding='utf-8') as f:
    json.dump(jsonData, f, ensure_ascii=False, indent=2)
    