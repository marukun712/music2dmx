export async function detectMusicSection(
  path: string,
  big_threshold: string,
  mid_threshold: string
) {
  const formData = new FormData();
  const file = Bun.file(path);
  const buf = await file.arrayBuffer();

  const blob = new Blob([buf], { type: "audio/wav" });

  formData.append("file", blob, "audio.wav");
  formData.append("big_threshold", big_threshold);
  formData.append("mid_threshold", mid_threshold);

  const req = await fetch("http://127.0.0.1:8000/analyze/", {
    method: "POST",
    body: formData,
  });

  const json = await req.json();

  return json;
}
