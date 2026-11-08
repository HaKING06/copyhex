import {cp,mkdir,rm} from 'node:fs/promises';
await mkdir('dist',{recursive:true});for(const f of ['index.html','css','js','assets','_headers','robots.txt','sitemap.xml'])await cp(f,`dist/${f}`,{recursive:true});console.log('Static site ready in dist/');
