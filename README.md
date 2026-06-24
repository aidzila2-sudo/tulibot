# VoiceScript + Sign Language AI

Aplikasi web full-stack untuk mengubah suara menjadi teks secara real-time dengan kontrol gestur tangan dan sensor gerakan perangkat!

## ✨ Fitur Utama

### 🔐 Sistem Autentikasi
- Login multi-user (Admin, User, Frontend, Backend, UI/UX)
- Database MySQL untuk menyimpan akun dan riwayat

### 🎤 Voice Recognition
- Ubah suara menjadi teks real-time menggunakan Web Speech API
- Dukungan Bahasa Indonesia (id-ID) dan Inggris (en-US)

### ✋ Sign Language & Gesture Control
- **MediaPipe Hands** untuk mendeteksi gestur tangan secara real-time
- **Gestur yang didukung**:
  - 👍 **Jempol ke atas**: Mulai merekam suara
  - 🖐️ **Tangan terbuka**: Berhenti merekam
  - ✊ **Tangan mengepal**: Menghapus teks
- Preview webcam dengan skeletal tracking
- Toggle kamera on/off

### 📱 Sensor Gerakan Perangkat (Device Motion)
- **Goyangkan perangkat (mobile)**: Menghapus teks secara instan (fitur shortcut)

### 📝 Kontrol Teks
- Salin teks ke clipboard
- Hapus teks
- Unduh file .txt
- Edit teks manual

### 📊 Statistik Real-time
- Jumlah karakter
- Jumlah kata
- Durasi rekaman
- Sisa batas karakter

### 📜 Riwayat Transkripsi
- Simpan riwayat transkripsi ke database
- Lihat, salin, dan hapus riwayat

### 🎨 Desain Modern
- Tema **Dark Mode futuristik**
- Warna ungu neon (#7c6dfa) sebagai aksen
- Responsif untuk desktop dan mobile
- Navbar atas (desktop) dan bottom bar (mobile)

## 🛠️ Teknologi yang Digunakan

| Bagian          | Teknologi                                      |
|-----------------|------------------------------------------------|
| Frontend        | HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript |
| Gesture         | MediaPipe Hands (via CDN)                      |
| Sensor          | DeviceMotion API                               |
| Speech          | Web Speech API                                 |
| Backend         | PHP 7.0+                                       |
| Database        | MySQL/MariaDB                                  |

## 📂 Struktur Proyek

```
voicescript/
├── database.sql                  # Schema database
├── README.md                     # Dokumentasi ini
├── backend/
│   ├── includes/
│   │   └── config.php            # Konfigurasi database
│   └── api/
│       ├── login.php
│       ├── logout.php
│       ├── check_session.php
│       └── transcripts.php
└── frontend/
    ├── login.html
    ├── index.html                # Halaman utama
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── login.js
    │   └── app.js
    └── assets/
```

## 🚀 Cara Menjalankan

### Prasyarat
1. **XAMPP** (atau web server dengan PHP dan MySQL)
2. Browser **Chrome/Edge** (untuk Web Speech API dan MediaPipe yang optimal)

### Langkah Instalasi

1. **Setup Database**
   - Buka phpMyAdmin
   - Import file `database.sql`
   - Database `voicescript` beserta tabel dan akun demo akan dibuat

2. **Jalankan Web Server**
   - Buka XAMPP Control Panel
   - Jalankan **Apache** dan **MySQL**

3. **Akses Aplikasi**
   - Buka browser: `http://localhost/New/frontend/login.html`

## 👤 Akun Demo

Berikut adalah akun yang bisa Anda gunakan untuk login:

| Email                 | Password | Role    |
|-----------------------|----------|---------|
| admin@voicescript.com | password | Admin   |
| user@voicescript.com  | password | User    |
| frontend@voicescript.com | password | Frontend |
| backend@voicescript.com  | password | Backend  |
| uiux@voicescript.com     | password | UI/UX   |

## 📖 Panduan Penggunaan

### 1. Login
Gunakan salah satu akun demo di atas untuk login.

### 2. Voice Recognition
- Pilih bahasa (Indonesia/Inggris)
- Klik tombol mikrofon **atau** gunakan gestur **👍 jempol ke atas** untuk mulai merekam
- Bicara dengan jelas
- Klik tombol lagi **atau** gunakan gestur **🖐️ tangan terbuka** untuk berhenti

### 3. Gesture Control
1. Klik **ikon kamera** di sudut kanan bawah untuk mengaktifkan kamera
2. Izinkan akses kamera
3. Pastikan tangan terlihat dengan jelas oleh kamera
4. Lakukan gestur sesuai panduan:

| Gestur          | Fungsi                     |
|-----------------|----------------------------|
| 👍 Jempol atas  | Mulai merekam              |
| 🖐️ Tangan buka  | Berhenti merekam           |
| ✊ Tangan kepal  | Menghapus semua teks       |

### 4. Sensor Gerakan (Mobile Only)
- Di perangkat mobile, **goyangkan perangkat** untuk menghapus teks secara instan
- Ada jeda 2 detik antara setiap deteksi goyangan

### 5. Kontrol Teks
- **Salin**: Klik tombol Salin
- **Hapus**: Klik tombol Hapus atau gunakan gestur ✊
- **Unduh**: Klik tombol Unduh untuk menyimpan sebagai file .txt
- **Simpan**: Simpan transkripsi ke database

## 📝 Catatan Penting

1. **Kompabilitas Browser**:
   - Voice Recognition dan MediaPipe bekerja optimal di **Chrome** atau **Edge**
   - Safari dan Firefox mungkin tidak mendukung semua fitur

2. **Izin Kamera & Mikrofon**:
   - Pastikan browser memiliki izin untuk mengakses kamera dan mikrofon
   - Jika izin ditolak, fitur tidak akan berfungsi

3. **Pencahayaan**:
   - Untuk deteksi gestur yang optimal, pastikan ruangan memiliki pencahayaan yang baik

4. **Jarak Kamera**:
   - Jarak tangan dengan kamera sekitar 1-2 meter untuk deteksi yang optimal

## 🎯 Fitur Lanjutan

- **Auto-stop**: Jika limit karakter tercapai, input akan otomatis dibatasi
- **Jeda Gestur**: Ada jeda 1,5 detik antara setiap eksekusi gestur untuk mencegah double-trigger
- **Status Indikator**: Status gestur dan kamera selalu terlihat jelas

## 🤝 Kontribusi

Feel free untuk mengembangkan aplikasi ini lebih lanjut!

---

Dibuat dengan ❤️ untuk kebutuhan speech-to-text yang mudah dan menyenangkan!
