const CACHE="copyhex-1.0.1-17e9596bac17";
const ASSETS=["/","/studio/","/about/","/guide/","/favorites/","/palettes/","/manifest.webmanifest","/LICENSE","/licenses/color-names-MIT.txt","/js/app.js","/js/catalog.js","/js/color-utils.js","/js/colors.js","/js/i18n.js","/js/info-pages.js","/js/pwa.js","/js/studio.js","/js/theme-init.js","/css/style.css","/assets/icon-180.png","/assets/icon-192.png","/assets/icon-512.png","/assets/logo.svg"];
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
