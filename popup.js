const video = document.getElementById("preview");
const canvas = document.getElementById("canvas");
const photoBtn = document.getElementById("photo");
const recordBtn = document.getElementById("record");
const clearBtn = document.getElementById("clear");
const gallery = document.getElementById("gallery");
const upload = document.getElementById("upload");

let mediaStream;
let recorder;
let recording = false;
let chunks = [];

// Camera start
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    mediaStream = stream;
    video.srcObject = stream;
  });

// Photo capture
photoBtn.onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  saveItem({ type: "image", data: canvas.toDataURL("image/png") });
};

// Video recording
recordBtn.onclick = () => {
  if (!recording) {
    recorder = new MediaRecorder(mediaStream);
    chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      saveItem({ type: "video", data: url });
    };
    recorder.start();
    recordBtn.textContent = "⏹ Stop";
    recording = true;
  } else {
    recorder.stop();
    recordBtn.textContent = "🎥 Record";
    recording = false;
  }
};

// Upload external images
upload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => saveItem({ type: "image", data: reader.result });
  reader.readAsDataURL(file);
};

// Storage helpers
function saveItem(item) {
  browser.storage.local.get({ items: [] }).then(res => {
    const items = [item, ...res.items].slice(0, 20);
    browser.storage.local.set({ items });
    render(items);
  });
}

clearBtn.onclick = () => {
  browser.storage.local.set({ items: [] });
  gallery.innerHTML = "";
};

// Gallery
function render(items) {
  gallery.innerHTML = "";
  items.forEach((item, i) => {
    const el = document.createElement(item.type === "image" ? "img" : "video");
    el.src = item.data;
    if (item.type === "video") el.controls = true;

    el.onclick = () => {
      browser.tabs.create({
        url: `viewer.html#index=${i}`
      });
    };

    gallery.appendChild(el);
  });
}

// Init
browser.storage.local.get({ items: [] }).then(res => render(res.items));
