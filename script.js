document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://tuandatuk.github.io/whatsapp-broadcast/";

  const qrModal = document.getElementById("qr-modal");
  const qrImage = document.getElementById("qr-preview");
  const logBox = document.getElementById("log-box");

  const startBtn = document.getElementById("startqr-button");
  const stopBtn = document.getElementById("stop-button");
  const listInput = document.getElementById("list-button");
  const dropImgInput = document.getElementById("image-input");
  const sendBtn = document.getElementById("send-button");

  const titleInput = document.getElementById("title");
  const descInput = document.getElementById("description");
  const linkInput = document.getElementById("link");

  let uploadedImage = null;
  let qrPollingInterval;

  async function fetchQR() {
    try {
      const res = await fetch(`${BASE_URL}/qr`);
      const data = await res.json();
      if (data.qr && data.qr.startsWith("data:image")) {
        qrImage.src = data.qr;
        qrModal.style.display = "flex";
      }
    } catch (err) {
      console.error("Failed to fetch QR", err);
    }
  }

  async function fetchLogs() {
    try {
      const res = await fetch(`${BASE_URL}/logs`);
      const data = await res.json();
      logBox.innerHTML = data.logs.map(l => `<div>${l}</div>`).join("");
      logBox.scrollTop = logBox.scrollHeight;

      const isReady = data.logs.some(l => l.includes("Connected to WhatsApp"));
      if (isReady) {
        qrModal.style.display = "none";
        clearInterval(qrPollingInterval);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  }

  startBtn.addEventListener("click", async () => {
    await fetch(`${BASE_URL}/start`, { method: "POST" });
    qrPollingInterval = setInterval(fetchQR, 1000);
  });

  stopBtn.addEventListener("click", async () => {
    await fetch(`${BASE_URL}/stop`, { method: "POST" });
    qrModal.style.display = "none";
    clearInterval(qrPollingInterval);
  });

  listInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    const form = new FormData();
    form.append("numbers", new Blob([lines.join("\n")], { type: "text/plain" }), "numbers.txt");

    await fetch(`${BASE_URL}/upload-numbers`, {
      method: "POST",
      body: form
    });

    alert("✅ List uploaded");
  });

  dropImgInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) uploadedImage = file;
  });

  sendBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const link = linkInput.value.trim();

    if (!title || !desc || !link) {
      alert("❗ Semua field (title, description, link) wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("link", link);
    if (uploadedImage) {
      formData.append("image", uploadedImage);
    }

    const res = await fetch(`${BASE_URL}/broadcast`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("📢 Broadcast sent!");
    } else {
      alert("❌ Gagal mengirim broadcast.");
    }
  });

  setInterval(fetchLogs, 2000);
});
