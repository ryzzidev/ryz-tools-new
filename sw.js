/**
 * Service Worker untuk Ryz Tools v1.5
 * Strategi: Cache-First (Optimal untuk performa super cepat dan Full Offline)
 */

// Ubah versi cache (misal ke v1.6) jika Anda melakukan perubahan pada kode HTML/CSS/JS di masa depan
const CACHE_NAME = 'ryz-tools-cache-v1.5';

// Daftar file/aset lokal dan eksternal yang WAJIB disimpan agar aplikasi bisa dibuka tanpa internet
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://files.catbox.moe/szj0c8.png' // Ikon/Logo aplikasi Anda
];

// 1. TAHAP INSTALL: Membuat ruang penyimpanan dan mengunduh semua aset di atas
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mengunduh aset dan menyimpannya ke memori HP...');
        // Menggunakan mode 'cors' untuk memastikan gambar dari luar (Catbox) terunduh dengan aman
        return Promise.all(
          assetsToCache.map((url) => {
            const request = new Request(url, { mode: 'cors' });
            return fetch(request)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Gagal mengunduh file: ${url}`);
                }
                return cache.put(request, response);
              })
              .catch((err) => console.error(`[Service Worker] Gagal cache: ${url}`, err));
          })
        );
      })
      .then(() => self.skipWaiting()) // Memaksa service worker baru langsung aktif saat itu juga
  );
});

// 2. TAHAP AKTIVASI: Membersihkan sisa-sisa cache versi lama agar memori internal HP tidak penuh
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache versi lama yang kedaluwarsa:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung mengambil alih kontrol halaman aplikasi
  );
});

// 3. TAHAP FETCH: Mencegat permintaan data. Selalu membaca memori HP terlebih dahulu sebelum internet.
self.addEventListener('fetch', (event) => {
  // Lewati permintaan yang bukan metode GET (seperti POST untuk form atau API tertentu jika ada)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // JIKA FILE ADA DI MEMORI HP: Langsung gunakan file tersebut (Instan & Bisa Offline)
      if (cachedResponse) {
        return cachedResponse;
      }

      // JIKA FILE BELUM ADA DI MEMORI: Ambil dari internet, lalu simpan otomatis ke memori HP untuk selanjutnya
      return fetch(event.request)
        .then((networkResponse) => {
          // Validasi respon dari internet sebelum disimpan
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          // Kloning respon karena data stream hanya bisa dibaca satu kali
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Opsi Fallback jika benar-benar offline dan file yang diminta tidak ada di cache
          console.log('[Service Worker] Perangkat offline dan data tidak ditemukan di memori lokal.');
        });
    })
  );
});
