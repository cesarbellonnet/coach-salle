// ===== Scan par code-barres (Open Food Facts) =====
// Gratuit et sans clé : on lit les chiffres du code-barres, puis on demande les valeurs pour 100 g à la base Open Food Facts.
// Lecture : le détecteur du navigateur s'il existe, sinon la bibliothèque Quagga (js/vendor), chargée seulement à ce moment-là.
function eanOK(c){if(!/^(\d{8}|\d{12}|\d{13})$/.test(c))return false;const d=c.split('').map(Number),k=d.pop();const s=d.reverse().reduce((t,x,i)=>t+x*(i%2?1:3),0);return (10-s%10)%10===k}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=()=>res();s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)})}
async function nativeDetector(){try{if(!('BarcodeDetector' in window))return null;const f=await BarcodeDetector.getSupportedFormats();const want=['ean_13','ean_8','upc_a','upc_e'].filter(x=>f.includes(x));return want.includes('ean_13')?new BarcodeDetector({formats:want}):null}catch(e){return null}}
function quaggaRead(src){return new Promise(res=>{try{Quagga.decodeSingle({src,numOfWorkers:0,locate:true,inputStream:{size:800},decoder:{readers:['ean_reader','ean_8_reader','upc_reader']}},r=>res(r&&r.codeResult&&r.codeResult.code||null))}catch(e){res(null)}})}

ACT.barcode=async()=>{
sheet(`<h2>Scanner un code-barres</h2><div class="cam" id="bcCam"><video id="bcV" playsinline muted autoplay></video><i></i></div><p class="note" id="bcMsg">J’ouvre la caméra…</p>
<form id="bcF" class="form" novalidate><label>Ou tape les chiffres sous le code-barres<input name="code" type="text" inputmode="numeric" autocomplete="off" placeholder="3017620422003"></label><button class="btn ghost full" type="submit">Chercher ce produit</button></form>
<p class="note">Valeurs fournies par Open Food Facts, une base libre remplie par des bénévoles. Pour un plat maison, utilise la photo.</p>`);
let live=true,stream=null,timer=null;const v=$('#bcV');
const msg=t=>{const m=$('#bcMsg');if(m&&live)m.textContent=t};
const noCam=t=>{const c=$('#bcCam');if(c&&live)c.hidden=true;msg(t)};
sheetOff=()=>{live=false;clearTimeout(timer);if(stream)stream.getTracks().forEach(t=>t.stop())};
$('#bcF').addEventListener('submit',ev=>{ev.preventDefault();const c=ev.target.elements.code.value.replace(/\D/g,'');if(!eanOK(c)){toast('Code incomplet ou mal recopié : vérifie les chiffres');return}lookupCode(c)});
if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){noCam('Caméra indisponible ici : tape les chiffres du code-barres.');return}
try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false})}
catch(e){noCam(e&&e.name==='NotAllowedError'?'Caméra refusée : autorise-la dans les réglages du téléphone, ou tape les chiffres.':'Caméra indisponible : tape les chiffres du code-barres.');return}
if(!live){stream.getTracks().forEach(t=>t.stop());return}
v.srcObject=stream;try{await v.play()}catch(e){}
const det=await nativeDetector();
if(!det&&!window.Quagga){try{await loadScript('js/vendor/quagga.min.js')}catch(e){noCam('Lecteur de code-barres indisponible : tape les chiffres.');return}}
msg('Vise le code-barres, bien à plat et net.');
// Sans détecteur intégré : on découpe la bande centrale de l'image et on la donne à Quagga. Un code doit être lu deux fois de suite pour être accepté.
const cv=document.createElement('canvas');let last='';
const frame=()=>{const W=v.videoWidth,H=v.videoHeight;if(!W)return null;const sw=W*.9,sh=H*.5,k=Math.min(1,800/sw);cv.width=Math.round(sw*k);cv.height=Math.round(sh*k);cv.getContext('2d').drawImage(v,W*.05,H*.25,sw,sh,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',.9)};
const tick=async()=>{if(!live)return;let c=null;try{if(det){const r=await det.detect(v);c=r&&r[0]&&r[0].rawValue}else{const f=frame();if(f)c=await quaggaRead(f)}}catch(e){}
if(!live)return;const ok=!!c&&eanOK(c);if(ok&&(det||c===last)){lookupCode(c);return}if(ok)last=c;timer=setTimeout(tick,det?200:80)};
tick()};

async function lookupCode(code){sheet(`<h2>Recherche du produit</h2><p class="thinking" id="scanStatus">Je cherche le code ${code}…</p>`);const ctl=new AbortController();scanCtl=ctl;
const fail=t=>{const st=$('#scanStatus');if(st){st.classList.remove('thinking');st.innerHTML=t+` <button class="link" data-act="barcode">Scanner un autre code</button><button class="link" style="margin-left:14px" data-act="manual">Saisir à la main</button>`}};
let d;try{const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_fr,brands,product_quantity,serving_quantity,nutriments`,{signal:ctl.signal});d=r.status===404?{status:0}:await r.json()}
catch(e){if(scanCtl===ctl)scanCtl=null;if(e&&e.name==='AbortError')return;fail('Pas de connexion, ou Open Food Facts ne répond pas.');return}
if(scanCtl!==ctl)return;scanCtl=null;const p=d&&d.product;if(!p||d.status===0){fail('Produit absent de la base Open Food Facts. Prends plutôt l’étiquette en photo.');return}
const n=p.nutriments||{},g=k=>{const x=parseFloat(n[k]);return isFinite(x)?x:null};let kcal=g('energy-kcal_100g');if(kcal==null&&g('energy_100g')!=null)kcal=g('energy_100g')/4.184;
if(kcal==null){fail('Ce produit est dans la base, mais sans ses valeurs nutritionnelles. Prends l’étiquette en photo.');return}
const p100={kcal,proteines:g('proteins_100g')||0,glucides:g('carbohydrates_100g')||0,lipides:g('fat_100g')||0};
// Quantité proposée : la portion indiquée, sinon le paquet entier s'il est petit, sinon 100 g
const sq=parseFloat(p.serving_quantity),pq=parseFloat(p.product_quantity);const grams=sq>0?sq:pq>0&&pq<=350?pq:100;
const brand=String(p.brands||'').split(',')[0].trim(),base=String(p.product_name_fr||p.product_name||'').trim();
const name=(base&&brand&&!base.toLowerCase().includes(brand.toLowerCase())?base+' '+brand:base||brand||'Produit '+code).slice(0,60);
mealForm({name,grams,kcal:kcal*grams/100,prot:p100.proteines*grams/100,carb:p100.glucides*grams/100,fat:p100.lipides*grams/100,p100},'Valeurs Open Food Facts pour 100 g. Ajuste la quantité mangée, et vérifie sur l’emballage si un chiffre te paraît bizarre.')}
