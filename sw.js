// NAMA CACHE DIBUAT UNIK KHUSUS APLIKASI KAS AGAR TIDAK BENTROK
const CACHE_NAME = 'kas-nasabah-cache-v1.0.0'; 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Install Service Worker & Simpan Cache Baru
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      }).catch(err => console.log('Gagal menyimpan cache:', err))
  );
});

// Activate Service Worker & Hapus Cache Lama (Khusus Kas Nasabah)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // LOGIKA PENTING: Hanya hapus cache yang berawalan 'kas-nasabah-cache-'
          if (cache.startsWith('kas-nasabah-cache-') && cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch/Load Web (Metode Network First)
self.addEventListener('fetch', event => {
  // PENTING: Abaikan request ke Supabase agar Realtime & Database tidak error CORS/Cache
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    // Coba ambil dari internet dulu agar selalu dapat versi HTML terbaru
    fetch(event.request)
      .catch(() => {
        // Jika offline atau koneksi putus, ambil dari cache
        return caches.match(event.request);
      })
  );
});