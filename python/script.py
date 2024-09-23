import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
import math
import json

# 音声ファイルをロード
y, sr = librosa.load("music/mirage_voyage.wav")
tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
print(tempo)

# 特徴量算出用のパラメタ
frame_length = 65536 # 特徴量を１つ算出するのに使うサンプル数
hop_length   = 16384 # 何サンプルずらして特徴量を算出するかを決める変数

# RMS：短時間ごとのエネルギーの大きさを算出
rms   = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
rms   /= np.max(rms)

# スペクトル重心：短時間ごとの音色の煌びやかさを算出
sc    = librosa.feature.spectral_centroid(y=y, n_fft=frame_length, hop_length=hop_length)[0]
sc    /= np.max(sc)

# 最大値探索で無視する,先頭と末尾のデータ数を指定
n_ignore = 10 

indices = np.argsort((sc+rms)[n_ignore:-n_ignore])[::-1] + n_ignore

times = np.floor(librosa.times_like(sc, hop_length=hop_length, sr=sr))

# 推定サビ時刻（秒）を算出
chorus_estimated_time = times[indices[0]]

# RMSの閾値を設定してセクションを判別
big_threshold = 0.88  # この閾値は調整可能
mid_threshold = 0.7

def get_section_label(value):
    if value > big_threshold:
        return "big"
    elif value > mid_threshold:
        return "mid"
    else:
        return "low"

# セクションごとのラベルを割り当て（大、中、小）
section_labels = [get_section_label(value) for value in rms]

section_start_time = times[0]  # セクションの開始時間
min_section_length = 4   # 最小セクションの長さ（フレーム数）
label_buffer = []

sections = []

def create_section(start, end, label):
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

# セクションのラベルと対応する時間を処理
for i, (time, label) in enumerate(zip(times, section_labels)):
    # ラベルをバッファに保存
    label_buffer.append(label)
      
    # ラベルが変わった時
    if i > 0 and section_labels[i - 1] != label:
        if(math.isclose(time, chorus_estimated_time, rel_tol=0.06)):
            create_section(section_start_time, times[i - 1], "big_chorus")
        elif len(label_buffer) >= min_section_length:
            create_section(section_start_time, times[i - 1], section_labels[i - 1])

        # セクション開始時間を更新
        section_start_time = times[i]
        label_buffer = []  # バッファをリセット

# 最後に残ったセクションを処理
if label_buffer:
    create_section(section_start_time, times[-1], section_labels[-1])

# JSON形式で出力
json_output = json.dumps(sections, ensure_ascii=False, indent=2)
print(json_output)

# JSONファイルに保存（オプション）
with open('music_sections.json', 'w', encoding='utf-8') as f:
    json.dump(sections, f, ensure_ascii=False, indent=2)