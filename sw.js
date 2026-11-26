/* Service worker Peta Misi Ijroat: supaya peta tetap jalan saat sinyal jelek.
   - Halaman sendiri (html, css, js): ambil dari jaringan dulu, kalau gagal pakai cadangan.
   - Leaflet dan font: simpan sekali, pakai dari cadangan.
   - Tile OpenStreetMap: hanya tile yang pernah dilihat yang disimpan (tanpa unduh massal), maksimal MAX_TILES.
   - Rute (OSRM) dan pencarian (Nominatim): selalu online, app sudah punya cadangan garis lurus. */
var VERSION = "v1";
var SHELL = "ijroat-shell-" + VERSION;
var LIBS = "ijroat-libs-" + VERSION;
var TILES = "ijroat-tiles";
var MAX_TILES = 1500;
var SHELL_FILES = ["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./icon.svg"];
var LIB_FILES = [
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
];
var LIB_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

function corsFetch(url) {
  return fetch(new Request(url, { mode: "cors", credentials: "omit" }));
}

self.addEventListener("install", function (e) {
  e.waitUntil(Promise.all([
    caches.open(SHELL).then(function (c) { return c.addAll(SHELL_FILES); }),
    caches.open(LIBS).then(function (c) {
      return Promise.all(LIB_FILES.map(function (u) {
        return corsFetch(u).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {});
      }));
    })
  ]).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  var keep = [SHELL, LIBS, TILES];
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) {
      return k.indexOf("ijroat-") === 0 && keep.indexOf(k) < 0;
    }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

var trimming = false;
function trimTiles() {
  if (trimming) return;
  trimming = true;
  caches.open(TILES).then(function (c) {
    return c.keys().then(function (keys) {
      var extra = keys.length - MAX_TILES;
      if (extra <= 0) return;
      return Promise.all(keys.slice(0, extra).map(function (k) { return c.delete(k); }));
    });
  }).catch(function () {}).then(function () { trimming = false; });
}

/* cache dulu, kalau belum ada ambil lewat CORS (bukan opaque, supaya tidak boros kuota) */
function cacheFirst(cacheName, req, onStore) {
  return caches.open(cacheName).then(function (c) {
    return c.match(req.url).then(function (hit) {
      if (hit) return hit;
      return corsFetch(req.url).then(function (r) {
        if (r.ok) { c.put(req.url, r.clone()); if (onStore) onStore(); }
        return r;
      }).catch(function () { return Response.error(); });
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  if (url.hostname === "tile.openstreetmap.org") {
    e.respondWith(cacheFirst(TILES, req, trimTiles));
    return;
  }
  if (LIB_HOSTS.indexOf(url.hostname) >= 0) {
    e.respondWith(cacheFirst(LIBS, req));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req, { cache: "no-cache" }).then(function (r) {
        if (r.ok) {
          var copy = r.clone();
          caches.open(SHELL).then(function (c) { c.put(req, copy); });
        }
        return r;
      }).catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (hit) {
          return hit || caches.match("./index.html");
        });
      })
    );
  }
  /* host lain (rute, pencarian): biarkan lewat jaringan seperti biasa */
});
