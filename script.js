// Recording state for Pengumuman Langsung
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let audioStream = null;
let recordedAudioUrl = null;
let isPlaying = false;
let recordingStartTime = null;
let recordingDuration = 0;

// Audio state for Code Warning
let currentAudio = null;
let currentCodeName = null;
let isAudioLooping = false;

// Play audio function
function playAudio(codeName) {
  const audioPath = `assets/audio/code/${codeName
    .toLowerCase()
    .replace(/ /g, "-")}.mp3`;
  const audio = new Audio(audioPath);
  audio.volume = 0.8; // Set volume to 80%
  audio.play().catch((error) => {
    console.log("Audio play error:", error);
  });
}

// Play audio 2 times (for CODE BLUE)
function playAudioTwice(codeName) {
  const audioPath = `assets/audio/code/${codeName
    .toLowerCase()
    .replace(/ /g, "-")}.mp3`;
  const audio = new Audio(audioPath);
  audio.volume = 0.8;

  let playCount = 0;
  audio.addEventListener("ended", function () {
    playCount++;
    if (playCount < 2) {
      audio.currentTime = 0;
      audio.play();
    }
  });

  audio.play().catch((error) => {
    console.log("Audio play error:", error);
  });
}

// Play audio with loop
function playAudioLoop(codeName) {
  if (currentAudio) {
    stopAudio();
  }

  const audioPath = `assets/audio/code/${codeName
    .toLowerCase()
    .replace(/ /g, "-")}.mp3`;
  currentAudio = new Audio(audioPath);
  currentAudio.volume = 0.8;
  currentAudio.loop = true; // Enable looping
  currentCodeName = codeName;
  isAudioLooping = true;

  currentAudio.play().catch((error) => {
    console.log("Audio play error:", error);
  });
}

// Stop audio
function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    isAudioLooping = false;
  }
}

// Start recording
function startRecording() {
  if (isRecording) {
    showNotification("⚠️ Sudah dalam mode rekam!", "error");
    return;
  }

  // Coba dengan audio constraints yang lebih fleksibel
  const audioConstraints = [
    { audio: { echoCancellation: true, noiseSuppression: true } },
    { audio: true },
  ];

  // Fungsi helper untuk mencoba constraint
  function tryGetUserMedia(constraints, index = 0) {
    if (index >= constraints.length) {
      const permissionGuide = document.getElementById(
        "microphonePermissionGuide"
      );
      if (permissionGuide) {
        permissionGuide.style.display = "block";
      }
      showNotification(
        "❌ Gagal mengakses microphone. Periksa izin browser atau coba refresh.",
        "error"
      );
      console.error("All audio constraints failed");
      return;
    }

    navigator.mediaDevices
      .getUserMedia(constraints[index])
      .then((stream) => {
        setupRecorder(stream);
      })
      .catch((error) => {
        console.warn(`Constraint ${index} failed:`, error.name, error.message);
        tryGetUserMedia(constraints, index + 1);
      });
  }

  tryGetUserMedia(audioConstraints);
}

// Setup recorder setelah mendapat stream
function setupRecorder(stream) {
  try {
    audioStream = stream;
    recordedChunks = [];

    // Cek browser kompatibilitas untuk MediaRecorder
    const options = { mimeType: "audio/webm" };

    // Fallback untuk browser yang tidak support webm
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "audio/mp4";
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "";
    }

    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onerror = (event) => {
      showNotification(`❌ Error saat merekam: ${event.error}`, "error");
      console.error("MediaRecorder error:", event.error);
      stopRecording();
    };

    mediaRecorder.start();
    isRecording = true;
    recordingStartTime = Date.now();

    showNotification("🎙️ Mulai merekam pengumuman...", "success");

    // Hide previous recording result when starting new recording
    const recordingResultBox = document.getElementById("recordingResult");
    if (recordingResultBox) {
      recordingResultBox.style.display = "none";
    }

    // Update button states - hanya Stop yang aktif saat merekam
    const recamBtn = document.querySelector(".btn-primary");
    recamBtn.disabled = true;
    recamBtn.style.opacity = "0.5";

    const stopBtn = document.querySelector(".btn-warning-stop");
    const sendBtn = document.querySelector(".btn-warning-send");
    const listenBtn = document.querySelector(".btn-warning-listen");

    stopBtn.disabled = false;
    stopBtn.style.opacity = "1";

    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";

    listenBtn.disabled = true;
    listenBtn.style.opacity = "0.5";
  } catch (error) {
    showNotification(`❌ Error setup recorder: ${error.message}`, "error");
    console.error("Setup recorder error:", error);
  }
}

// Stop recording
function stopRecording() {
  if (!isRecording || !mediaRecorder) {
    showNotification("⚠️ Belum ada rekaman yang sedang berlangsung", "error");
    return;
  }

  mediaRecorder.stop();
  isRecording = false;

  // Calculate recording duration
  if (recordingStartTime) {
    recordingDuration = (Date.now() - recordingStartTime) / 1000;
  }

  // Stop audio stream
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop());
  }

  showNotification("⏹️ Rekaman dihentikan", "info");

  const btn = document.querySelector(".btn-primary");
  btn.disabled = false;
  btn.style.opacity = "1";

  const stopBtn = document.querySelector(".btn-warning-stop");
  const sendBtn = document.querySelector(".btn-warning-send");
  const listenBtn = document.querySelector(".btn-warning-listen");

  stopBtn.disabled = true;
  stopBtn.style.opacity = "0.5";

  sendBtn.disabled = false;
  sendBtn.style.opacity = "1";

  listenBtn.disabled = false;
  listenBtn.style.opacity = "1";

  // Update recording result display after a short delay (for chunks to be processed)
  setTimeout(updateRecordingResult, 100);
}

// Update recording result display
function updateRecordingResult() {
  if (recordedChunks.length === 0) {
    return;
  }

  const recordingResultBox = document.getElementById("recordingResult");
  if (!recordingResultBox) {
    return;
  }

  // Create blob and generate URL for playback
  const blob = new Blob(recordedChunks, { type: "audio/webm" });
  recordedAudioUrl = URL.createObjectURL(blob);

  // Calculate total blob size
  const totalSize = recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const fileSizeKB = (totalSize / 1024).toFixed(2);

  // Format duration as MM:SS
  const minutes = Math.floor(recordingDuration / 60);
  const seconds = Math.floor(recordingDuration % 60);
  const durationFormatted = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  // Determine audio format
  let audioFormat = "WebM Audio";
  if (mediaRecorder && mediaRecorder.mimeType) {
    if (mediaRecorder.mimeType.includes("mp4")) {
      audioFormat = "MP4 Audio";
    } else if (mediaRecorder.mimeType.includes("webm")) {
      audioFormat = "WebM Audio";
    } else if (mediaRecorder.mimeType.includes("ogg")) {
      audioFormat = "OGG Audio";
    }
  }

  // Update result elements
  const resultStatus = document.getElementById("resultStatus");
  const resultDuration = document.getElementById("resultDuration");
  const resultSize = document.getElementById("resultSize");
  const resultFormat = document.getElementById("resultFormat");

  if (resultStatus)
    resultStatus.textContent = "Siap untuk didengar dan dikirim";
  if (resultDuration) resultDuration.textContent = durationFormatted;
  if (resultSize) resultSize.textContent = `${fileSizeKB} KB`;
  if (resultFormat) resultFormat.textContent = audioFormat;

  // Show result box
  recordingResultBox.style.display = "block";
}

// Send recording
function sendRecording() {
  if (recordedChunks.length === 0) {
    showNotification("⚠️ Tidak ada rekaman untuk dikirim", "error");
    return;
  }

  // Create blob from recorded chunks
  const blob = new Blob(recordedChunks, { type: "audio/webm" });

  // Save audio URL for later playback
  recordedAudioUrl = URL.createObjectURL(blob);

  // Convert blob to Base64 for broadcasting to other devices
  const reader = new FileReader();
  reader.onload = () => {
    // reader.result is data:audio/webm;base64,...
    const audioBase64 = reader.result;

    // Broadcast announcement to all connected devices
    if (typeof broadcastAnnouncement === "function") {
      broadcastAnnouncement(audioBase64, recordingDuration);
      console.log("📢 Broadcasting announcement to all devices");
    }

    showNotification("✅ Pengumuman dikirim ke semua display!", "success");

    // Enable listen button
    const listenBtn = document.querySelector(".btn-warning-listen");
    listenBtn.disabled = false;
    listenBtn.style.opacity = "1";

    const sendBtn = document.querySelector(".btn-warning-send");
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";
  };

  reader.onerror = () => {
    showNotification("❌ Gagal mengkonversi audio untuk broadcast", "error");
  };

  // Read blob as data URL (Base64)
  reader.readAsDataURL(blob);

  console.log("Recording data:", blob);
}

// Listen to recording
function listenRecording() {
  if (!recordedAudioUrl) {
    showNotification(
      "⚠️ Tidak ada rekaman untuk didengar. Rekam dan kirim terlebih dahulu.",
      "error"
    );
    return;
  }

  if (isPlaying) {
    showNotification("⚠️ Sudah dalam mode dengarkan", "error");
    return;
  }

  const audio = new Audio(recordedAudioUrl);
  audio.volume = 0.8;

  audio.onplay = () => {
    isPlaying = true;
    const listenBtn = document.querySelector(".btn-warning-listen");
    listenBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
  };

  audio.onpause = () => {
    isPlaying = false;
    const listenBtn = document.querySelector(".btn-warning-listen");
    listenBtn.innerHTML = '<i class="fas fa-headphones"></i> Dengar';
  };

  audio.onended = () => {
    isPlaying = false;
    const listenBtn = document.querySelector(".btn-warning-listen");
    listenBtn.innerHTML = '<i class="fas fa-headphones"></i> Dengar';
  };

  audio.play().catch((error) => {
    showNotification("❌ Gagal memutar rekaman", "error");
    console.error("Playback error:", error);
  });
}

// Open Code Blue Modal
function openCodeBlueModal() {
  const modal = document.getElementById("codeBlueModal");
  modal.classList.add("show");
}

// Close Modal
function closeModal() {
  const modal = document.getElementById("codeBlueModal");
  modal.classList.remove("show");
}

// Trigger Code Blue with location
function triggerCodeBlueLocation(location) {
  showNotification(`🚨 CODE BLUE dipanggil di ${location}!`, "error");

  // Play audio for CODE BLUE 2 times
  playAudioTwice("CODE BLUE");

  // Broadcast CODE BLUE to all connected devices
  if (typeof broadcastCode === "function") {
    broadcastCode("CODE BLUE", location);
    console.log("📢 Broadcasting CODE BLUE to all devices");
  }

  // Add visual feedback
  event.target.style.animation = "pulse 0.5s ease-out";
  setTimeout(() => {
    event.target.style.animation = "";
  }, 500);

  // Close modal after delay
  setTimeout(() => {
    closeModal();
  }, 500);
}

// Open audio control modal
function openAudioControlModal(codeName) {
  const modal = document.getElementById("audioControlModal");
  const titleElement = document.querySelector(".audio-modal-title");
  titleElement.textContent = `Kontrol ${codeName}`;

  // Store code name for later use
  modal.dataset.codeName = codeName;
  modal.classList.add("show");

  // Don't play audio immediately, wait for user to click Play button
  updateAudioControlButtons();
}

// Close audio control modal
function closeAudioControlModal() {
  const modal = document.getElementById("audioControlModal");
  modal.classList.remove("show");
  stopAudio();
}

// Update audio control buttons
function updateAudioControlButtons() {
  const playBtn = document.querySelector(".btn-audio-play");
  const stopBtn = document.querySelector(".btn-audio-stop");

  if (isAudioLooping) {
    playBtn.disabled = true;
    playBtn.style.opacity = "0.5";
    stopBtn.disabled = false;
    stopBtn.style.opacity = "1";
  } else {
    playBtn.disabled = false;
    playBtn.style.opacity = "1";
    stopBtn.disabled = true;
    stopBtn.style.opacity = "0.5";
  }
}

// Play button handler
function handlePlayAudio() {
  if (!isAudioLooping) {
    const codeName =
      document.getElementById("audioControlModal").dataset.codeName;
    playAudioLoop(codeName);

    // Broadcast code to all connected devices
    if (typeof broadcastCode === "function") {
      broadcastCode(codeName);
      console.log(`📢 Broadcasting ${codeName} to all devices`);
    }

    updateAudioControlButtons();
  }
}

// Stop button handler
function handleStopAudio() {
  stopAudio();
  updateAudioControlButtons();
}

// Trigger Code Blue
function triggerCodeBlue(location) {
  openAudioControlModal(location);
}

// Open link in new tab
function openLink(event) {
  event.preventDefault();
  const url = event.target.getAttribute("data-url");

  if (url) {
    window.open(url, "_blank");
  } else {
    const featureName = event.target
      .closest(".feature-card")
      .querySelector("h3").textContent;
    showNotification(`Link untuk ${featureName} belum tersedia`);
  }
}

// Smooth scroll on navigation links
document
  .querySelectorAll('a[href^="#"]:not(.btn-feature)')
  .forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

// Notification function
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.textContent = message;

  let bgColor = "#2563eb"; // default blue
  if (type === "error") bgColor = "#dc2626"; // red
  if (type === "success") bgColor = "#22c55e"; // green

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.95);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// Add animation to elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe feature cards
document.querySelectorAll(".feature-card").forEach((card) => {
  observer.observe(card);
});

// Close modal when clicking outside of it
window.addEventListener("click", function (event) {
  const modal = document.getElementById("codeBlueModal");
  if (modal && event.target === modal) {
    closeModal();
  }
});

// Search Functionality
function toggleSearch() {
  const searchBar = document.getElementById("searchBar");
  const searchInput = document.getElementById("featureSearch");

  if (searchBar) {
    searchBar.classList.toggle("show");
    if (searchBar.classList.contains("show")) {
      searchInput.focus();
    } else {
      searchInput.value = "";
      searchFeatures();
    }
  }
}

function searchFeatures() {
  const searchInput = document.getElementById("featureSearch");
  const searchTerm = searchInput.value.toLowerCase().trim();
  const featureCards = document.querySelectorAll(".feature-card");
  let foundCount = 0;

  featureCards.forEach((card) => {
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const titleText = title ? title.textContent.toLowerCase() : "";
    const descText = description ? description.textContent.toLowerCase() : "";

    if (
      titleText.includes(searchTerm) ||
      descText.includes(searchTerm) ||
      searchTerm === ""
    ) {
      card.style.display = "grid";
      card.style.animation = "fadeIn 0.3s ease-out";
      foundCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Show message if no results found
  if (searchTerm !== "" && foundCount === 0) {
    showNotification(`❌ Fitur "${searchTerm}" tidak ditemukan`, "warning");
  }
}

// Close search when pressing Escape
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const searchBar = document.getElementById("searchBar");
    if (searchBar && searchBar.classList.contains("show")) {
      toggleSearch();
    }
  }
});
