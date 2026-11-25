# Peta Misi Ijroat

Peta misi pribadi untuk 8 langkah ijroat mahasiswa baru Syariah Banin tingkat 1, Al-Azhar Cairo. Tampilannya peta malam gaya game: rute waypoint magenta ke pos berikutnya, titik GPS live, syarat berkas yang bisa dicentang, plus foto dan catatan per pos.

## Fitur

- Peta asli OpenStreetMap (tile standar, digelapkan lewat CSS filter, tanpa API key)
- Lacak lokasi GPS dan rute jalan kaki asli ke pos berikutnya (FOSSGIS OSRM), lengkap dengan jarak dan perkiraan menit
- Tombol "Navigasi di Google Maps" untuk navigasi belokan demi belokan
- Pos bisa dikunci ke lokasi asli: pakai GPS, geser pin, atau cari tempat di OpenStreetMap
- Checklist 8 langkah dan syarat berkas, foto tiap pos, dan catatan
- Cadangkan dan pulihkan progres sebagai file JSON (tanpa foto)

## Struktur

- `index.html` markup halaman
- `style.css` tampilan (token warna di `:root`)
- `app.js` data langkah, peta, GPS, rute, penyimpanan
- `manifest.webmanifest` dan `icon.svg` supaya bisa dipasang di layar utama HP

## Data

Semua data tersimpan di HP sendiri: progres dan catatan di `localStorage`, foto di IndexedDB. Tidak ada server dan tidak ada data pribadi di repo ini.

## Sumber

- Langkah ijroat: carousel edukasi SEMA FSI Al-Azhar Cairo. Jam buka bisa berubah, cek lagi ke senior atau Syuun.
- Koordinat awal: OpenStreetMap ("Faculty Of Shariah And Law Cairo" dan "Faculty Of Medicine", Nasr City). Posisi loket di dalam fakultas masih perkiraan.
- Peta © OpenStreetMap contributors. Rute: routing.openstreetmap.de (FOSSGIS).

## Menjalankan

Tanpa proses build. Buka lewat GitHub Pages atau server lokal apa pun (`python -m http.server`). GPS butuh HTTPS atau `localhost`.
