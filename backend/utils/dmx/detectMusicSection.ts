export async function detectMusicSection(
  blob: Blob,
  big_threshold: string,
  mid_threshold: string
) {
  const formData = new FormData();

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
