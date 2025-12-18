# Audio Files untuk Game

## 📁 Required Audio Files

Simpan file audio berikut di folder `/audio/`:

### 1. **game-start.mp3**

- **Deskripsi:** Sound effect saat game dimulai
- **Durasi:** 1-2 detik
- **Contoh:** Suara "ding" atau "whoosh" energetik
- **Recommended:** https://freesound.org/

### 2. **click.mp3**

- **Deskripsi:** Sound effect saat user klik jawaban
- **Durasi:** < 0.5 detik
- **Contoh:** Suara klik soft/button press
- **Recommended:** Suara tap ringan

### 3. **correct.mp3**

- **Deskripsi:** Sound effect saat jawaban BENAR
- **Durasi:** 1-2 detik
- **Contoh:** Suara "ding", "chime", atau "success bell"
- **Recommended:** Suara ceria/positif

### 4. **wrong.mp3**

- **Deskripsi:** Sound effect saat jawaban SALAH
- **Durasi:** 1-2 detik
- **Contoh:** Suara "buzzer" atau "error"
- **Recommended:** Suara lembut, tidak terlalu harsh

### 5. **complete.mp3**

- **Deskripsi:** Sound effect saat selesai mengerjakan semua soal
- **Durasi:** 2-3 detik
- **Contoh:** Suara "completion" atau "finished"
- **Recommended:** Suara netral/anticipation

### 6. **success.mp3**

- **Deskripsi:** Sound effect saat LULUS (passed test)
- **Durasi:** 3-5 detik
- **Contoh:** Suara "victory", "fanfare", "celebration"
- **Recommended:** Suara celebratory yang happy

### 7. **fail.mp3**

- **Deskripsi:** Sound effect saat TIDAK LULUS
- **Durasi:** 2-3 detik
- **Contoh:** Suara "sad trombone" atau "gentle fail"
- **Recommended:** Suara yang encouraging, bukan mengecewakan

### 8. **unlock.mp3**

- **Deskripsi:** Sound effect saat level baru terbuka
- **Durasi:** 2-3 detik
- **Contoh:** Suara "unlock", "achievement unlocked"
- **Recommended:** Suara rewarding/achievement

---

## 🎵 Sumber Audio Gratis

### 1. **Freesound.org**

- https://freesound.org/
- Filter: Creative Commons 0 (Public Domain)
- Search keywords: "game", "ui", "button", "success", "fail"

### 2. **Mixkit**

- https://mixkit.co/free-sound-effects/
- Section: UI & Game Sounds
- Format: MP3, Royalty-free

### 3. **Zapsplat**

- https://www.zapsplat.com/
- Category: Game Sounds > UI
- Free dengan attribution

### 4. **Pixabay**

- https://pixabay.com/sound-effects/
- Filter: Free to use
- Download: MP3

---

## 🔧 Format Recommendations

- **Format:** MP3 (compatible dengan semua browser)
- **Bitrate:** 128-192 kbps
- **Sampling:** 44.1 kHz
- **Size:** < 100KB per file (untuk loading cepat)
- **Volume:** Normalized, tidak terlalu loud

---

## 📝 Fallback Behavior

Jika file audio tidak ditemukan:

- ✅ Game tetap berjalan normal
- ⚠️ Warning di console, tapi tidak error
- 🔇 Audio disabled automatically untuk file yang gagal load

---

## 🧪 Testing

Setelah menambahkan file audio:

1. Buka browser console
2. Check log: `🔊 Audio Manager initialized`
3. Test play: `audioManager.playGameStart()`
4. Check error: `⚠️ Failed to load sound: ...`

---

## 🎮 Integration dalam Game

File audio akan auto-load saat page load via `audio-manager.js`.

Tidak perlu action manual, sistem handle otomatis:

- ✅ Auto preload semua file
- ✅ Graceful error handling
- ✅ Volume control (localStorage)
- ✅ Toggle on/off

---

**Note:** Untuk development awal, game akan tetap berfungsi tanpa audio files. Warning akan muncul di console tapi tidak akan break aplikasi.
