"use strict";
// ===== Accès à Claude =====
// Deux modes, même interface ({json, limits}) pour le reste de l'app :
// 1. Ouverte sur claude.ai : passe par ton compte Claude (window.claude.use('sample')).
// 2. Hébergée par toi (GitHub Pages) : appelle l'API Anthropic avec ta clé.
// La clé reste dans le stockage de CE téléphone. Elle n'est ni dans le code, ni dans les sauvegardes.
const API_KEY_STORE='coach-salle-apikey';
const API_MODEL='claude-haiku-4-5-20251001'; // rapide, lit les images, le moins cher de la gamme
function getApiKey(){try{return localStorage.getItem(API_KEY_STORE)||''}catch(e){return ''}}
function setApiKey(k){try{if(k)localStorage.setItem(API_KEY_STORE,k);else localStorage.removeItem(API_KEY_STORE)}catch(e){}}
function blobToB64(b){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const s=String(r.result);res({data:s.slice(s.indexOf(',')+1),type:(s.match(/^data:([^;]+)/)||[])[1]||'image/jpeg'})};r.onerror=()=>rej(r.error);r.readAsDataURL(b)})}
// Réduit la photo avant l'envoi : moins de tokens, donc moins cher et plus rapide
async function prepImage(file){const url=await shrink(file,1280);if(url&&url.startsWith('data:')){return{data:url.slice(url.indexOf(',')+1),type:'image/jpeg'}}return blobToB64(file)}
function apiErr(code,msg){const e=new Error(msg||code);e.code=code;return e}
function parseJSONText(t){const clean=String(t||'').replace(/```json|```/g,'').trim();try{return JSON.parse(clean)}catch(e){}const m=clean.match(/[\[{][\s\S]*[\]}]/);if(m){try{return JSON.parse(m[0])}catch(e){}}throw apiErr('invalid_json')}
function apiSample(key){
  async function call(prompt,opts={}){
    const content=[];const imgs=opts.images?(Array.isArray(opts.images)?opts.images:[opts.images]):[];
    for(const f of imgs){const im=await prepImage(f);content.push({type:'image',source:{type:'base64',media_type:im.type,data:im.data}})}
    content.push({type:'text',text:prompt+'\n\nRéponds uniquement avec le JSON demandé, sans texte autour ni balises Markdown.'});
    let r;
    try{r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:opts.signal,headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:API_MODEL,max_tokens:1024,messages:[{role:'user',content}]})})}
    catch(e){if(e&&e.name==='AbortError')throw apiErr('cancelled');throw apiErr('network','Pas de connexion internet.')}
    if(!r.ok){let m='';try{m=(await r.json()).error.message}catch(e){}if(r.status===401)throw apiErr('bad_key',m);if(r.status===429)throw apiErr('rate_limited',m);if(r.status===400&&/credit/i.test(m))throw apiErr('no_credit',m);throw apiErr('api_error',m||('Erreur '+r.status))}
    const d=await r.json();const txt=(d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n');return parseJSONText(txt)}
  return{json:call,limits:async()=>({images:true}),mode:'api'}
}
