import { cp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import "./scripts/generate-pages.mjs";
const dirs = [
  "css",
  "js",
  "assets",
  "about",
  "guide",
  "studio",
  "favorites",
  "palettes",
  "licenses",
];
const files = [
  "index.html",
  "_headers",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "LICENSE",
];
await mkdir("dist", { recursive: true });
for (const item of [...dirs, ...files])
  await cp(item, `dist/${item}`, { recursive: true });
const assets = [
  "/",
  "/studio/",
  "/about/",
  "/guide/",
  "/favorites/",
  "/palettes/",
  "/manifest.webmanifest",
  "/LICENSE",
  "/licenses/color-names-MIT.txt",
];
for (const dir of ["js", "css", "assets"])
  for (const file of await readdir(dir))
    if (!file.includes("poster")) assets.push(`/${dir}/${file}`);
const hash = createHash("sha256");
for (const asset of assets)
  hash.update(
    await readFile(
      "dist" + (asset.endsWith("/") ? asset + "index.html" : asset),
    ),
  );
const cacheName = "copyhex-1.0.1-" + hash.digest("hex").slice(0, 12);
const sw = `const CACHE=${JSON.stringify(cacheName)};
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('copyhex-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(ASSETS.includes(url.pathname)){
      const saved=await cache.match(url.pathname);
      if(saved)return saved;
    }
    try{return await fetch(event.request);}
    catch{return await cache.match(event.request)||await cache.match(url.pathname)||(event.request.mode==='navigate'?await cache.match('/'):Response.error());}
  })());
});
`;
await writeFile("sw.js", sw);
await writeFile("dist/sw.js", sw);
console.log(`CopyHex 1.0.1 built. ${cacheName}`);
