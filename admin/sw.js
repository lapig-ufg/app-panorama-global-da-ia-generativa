/* Service worker da PWA de curadoria.
   Cacheia só o app-shell (para instalar/abrir offline). Dados da planilha e as ações
   (gviz / Apps Script) são SEMPRE rede — nunca cacheados. */
var CACHE = "curadoria-ia-v3";
var SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "../assets/data.js"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  // Cross-origin (Google Sheets / Apps Script): sempre rede, sem cache.
  if (new URL(req.url).origin !== self.location.origin) return;
  // App-shell same-origin: rede primeiro, cai pro cache offline.
  e.respondWith(
    fetch(req).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return resp;
    }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match("./index.html"); }); })
  );
});
