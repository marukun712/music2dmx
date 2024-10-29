const input = document.getElementById("file");
const audio = document.getElementById("audio");

const big_threshold = document.getElementById("big_threshold");
const mid_threshold = document.getElementById("mid_threshold");

let loading = false;

async function detectMusicSection(blob, big_threshold, mid_threshold) {
  const formData = new FormData();

  formData.append("file", blob, "audio.wav");
  formData.append("big_threshold", big_threshold);
  formData.append("mid_threshold", mid_threshold);

  const req = await fetch("http://localhost:8000/analyze/", {
    method: "POST",
    body: formData,
  });

  const json = await req.json();

  return json;
}

async function onChangeFile() {
  const file = input.files[0];
  const blob = new Blob([file], { type: file.type });

  const url = URL.createObjectURL(blob);

  loading = true;

  document.getElementById("container").insertAdjacentHTML(
    "beforeend",
    `
    <dialog id="my_modal_1" class="modal modal-open">
<div class="modal-box">
  <svg
    class="m-auto w-12 h-12 my-6 animate-bounce fill-white"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 344.156 344.156"
    xml:space="preserve"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <g>
        <path
          d="M343.766,28.723c0-5.525-4.483-10.006-10.006-10.006H106.574c-5.531,0-10.006,4.48-10.006,10.006v194.18 c-10.25-8.871-23.568-14.279-38.156-14.279C26.207,208.623,0,234.824,0,267.029c0,32.209,26.207,58.41,58.412,58.41 c32.215,0,58.412-26.201,58.412-58.41c0-2.854-0.246-175.924-0.246-175.924h207.176v131.666 c-10.229-8.795-23.487-14.148-38.008-14.148c-32.217,0-58.412,26.201-58.412,58.406c0,32.209,26.195,58.41,58.412,58.41 c32.205,0,58.41-26.201,58.41-58.41C344.156,264.068,343.766,28.723,343.766,28.723z M58.412,305.43 c-21.174,0-38.4-17.227-38.4-38.4c0-21.17,17.227-38.396,38.4-38.396s38.4,17.228,38.4,38.396 C96.812,288.203,79.586,305.43,58.412,305.43z M116.578,71.094V38.728h207.176v32.365L116.578,71.094L116.578,71.094z M285.746,305.43c-21.174,0-38.4-17.227-38.4-38.4c0-21.17,17.228-38.396,38.4-38.396s38.4,17.228,38.4,38.396 C324.146,288.203,306.92,305.43,285.746,305.43z"
        ></path>
      </g>
    </g>
  </svg>

  <h3 class="text-lg font-bold text-center">音楽を分析中...</h3>
</div>
</dialog>
`
  );

  const lightingData = await detectMusicSection(
    blob,
    big_threshold.value,
    mid_threshold.value
  );

  await fetch("http://localhost:8080/start/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lightingData),
  });

  document.getElementById("audio").setAttribute("src", url);
  loading = false;
  document.getElementById("my_modal_1").remove();

  audio.play();
}

async function onEnd() {
  if (!loading) {
    await fetch("http://localhost:8080/end/");
  }
}

async function sendCurrentTime() {
  if (!loading) {
    await fetch("http://localhost:8080/setTime/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ time: audio.currentTime }),
    });
  }
}

function onChangeSlider(type, event) {
  if (type == "big") {
    document.getElementById("bigValue").innerHTML = event.target.value;
  } else if (type == "mid") {
    document.getElementById("midValue").innerHTML = event.target.value;
  }
}

audio.addEventListener("seeked", sendCurrentTime);
audio.addEventListener("pause", sendCurrentTime);
audio.addEventListener("play", sendCurrentTime);
audio.addEventListener("timeupdate", () => {
  if (!audio.paused && !audio.seeking) {
    sendCurrentTime();
  }
});
audio.addEventListener("ended", onEnd);

input.addEventListener("change", onChangeFile);
big_threshold.addEventListener("input", (event) => {
  onChangeSlider("big", event);
});
mid_threshold.addEventListener("input", (event) => {
  onChangeSlider("mid", event);
});
