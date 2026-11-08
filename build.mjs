import { localeCodes } from "./js/locales.js";
import { cp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
await writeFile('js/version.js', `// Generated from package.json during build.\nexport const VERSION = ${JSON.stringify(version)};\n`);
await import('./scripts/generate-pages.mjs');
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
  ...localeCodes,
  "discover",
  "palette-generator",
  "resources",
  "sitemaps",
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
const pages = JSON.parse(await readFile("data/page-manifest.json", "utf8"));
const assets = [
  ...new Set([
    "/",
    "/studio/",
    "/about/",
    "/guide/",
    "/favorites/",
    "/palettes/",
    "/discover/",
    "/palette-generator/",
    "/resources/",
    "/manifest.webmanifest",
    "/LICENSE",
    "/licenses/color-names-MIT.txt",
    ...pages
      .filter((p) => !["collection", "article"].includes(p.view))
      .map((p) => p.path),
  ]),
];
async function includeAssets(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = dir + "/" + entry.name;
    if (entry.isDirectory()) await includeAssets(file);
    else if (!file.endsWith(".png") || entry.name.startsWith("icon-"))
      assets.push("/" + file);
  }
}
for (const dir of ["js", "css", "assets"]) await includeAssets(dir);
const hash = createHash("sha256");
for (const asset of assets)
  hash.update(
    await readFile(
      "dist" + (asset.endsWith("/") ? asset + "index.html" : asset),
    ),
  );
const cacheName = `copyhex-${version}-` + hash.digest("hex").slice(0, 12);
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
    try{const response=await fetch(event.request);if(response.ok&&url.pathname.startsWith('/assets/')){const copy=response.clone();event.waitUntil(cache.put(url.pathname,copy));}return response;}
    catch{return await cache.match(event.request)||await cache.match(url.pathname)||(event.request.mode==='navigate'?await cache.match('/'):Response.error());}
  })());
});
`;
await writeFile("sw.js", sw);
await writeFile("dist/sw.js", sw);
console.log(`CopyHex ${version} built. ${cacheName}`);
