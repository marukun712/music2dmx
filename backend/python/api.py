import librosa
import librosa.display
import numpy as np
import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List

app = FastAPI()

# 音量から照明効果の大/中/小を区分
def get_section_label(value, big_threshold:float, mid_threshold:float):
    if value > big_threshold:
        return "big"
    elif value > mid_threshold:
        return "mid"
    else:
        return "low"

# 音声解析関数
def analyze_audio(file_path: str, big_threshold:float, mid_threshold:float):
    y, sr = librosa.load(file_path)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)

    frame_length = 65536
    hop_length = 16384

    # RMS計算
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    rms = rms / np.max(rms)  # Normalize

    # スペクトル重心計算
    sc = librosa.feature.spectral_centroid(y=y, n_fft=frame_length, hop_length=hop_length)[0]
    sc = sc / np.max(sc)  # Normalize

    times = librosa.times_like(sc, hop_length=hop_length, sr=sr)
    total_duration = times[-1]

    start_time_for_chorus = total_duration * 0.6
    start_frame = np.where(times >= start_time_for_chorus)[0][0]

    indices = np.argsort((sc[start_frame:] + rms[start_frame:]))[::-1] + start_frame
    chorus_estimated_time = float(times[indices[0]])

    # セクションラベルを生成
    section_labels = [get_section_label(float(value), big_threshold, mid_threshold) for value in rms]  # Convert to Python float
    min_section_length = 4
    label_buffer = []
    last_created = 0

    sections = []
    jsonData = {
        "bpm": float(tempo),  # Convert to Python float
        "sections": sections
    }

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

    for i, (time, label) in enumerate(zip(times, section_labels)):
        label_buffer.append(label)
        if i > 0 and section_labels[i - 1] != label:
            if time > chorus_estimated_time and (section_labels[i - 1] == "big"):
                create_section(last_created, times[i - 1], "big_chorus")
                last_created = times[i - 1]
            elif len(label_buffer) >= min_section_length:
                create_section(last_created, times[i - 1], section_labels[i - 1])
                last_created = times[i - 1]
            label_buffer = []

    if label_buffer:
        create_section(last_created, times[-1], section_labels[-1])

    return jsonData

# APIエンドポイント
@app.post("/analyze/")
async def analyze(file: UploadFile = File(...), big_threshold = Form(), mid_threshold = Form()):
    big_threshold = float(big_threshold)
    mid_threshold = float(mid_threshold)

    file_location = f"./temp/{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    # 音声解析を実行
    result = analyze_audio(file_location,big_threshold,mid_threshold)

    # 結果をJSONで返す
    return JSONResponse(content=result)