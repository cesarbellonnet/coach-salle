// Capacités Claude (lecture d'étiquette, idées de repas, export)
let sampleFn=null,sampleOK=false,imgOK=false,dlFn=null;
const framed=(()=>{try{return window.self!==window.top}catch(e){return true}})();
async function initAI(){sampleFn=null;sampleOK=false;imgOK=false;
if(window.claude&&typeof window.claude.use==='function'){try{const[s,d]=await Promise.all([window.claude.use('sample'),window.claude.use('downloads')]);dlFn=d;if(s){sampleFn=s;sampleOK=true;try{const l=await s.limits();imgOK=!!(l&&l.images)}catch(e){}}}catch(e){}}
// Pas de compte Claude disponible, ou pas de lecture d'image : on passe par la clé API si elle est réglée
if((!sampleFn||!imgOK)&&getApiKey()){sampleFn=apiSample(getApiKey());sampleOK=true;imgOK=true}
render()}
// Lancé une fois que tous les fichiers JS sont chargés
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAI);else setTimeout(initAI,0);
function errMsg(code){if(code==='not_granted'||code==='sampling_disabled'||code==='not_declared'||code==='capability_disabled'){sampleOK=false;return "L'accès à Claude est refusé pour cette app. Saisis les valeurs à la main."}
return({bad_key:'Clé API refusée. Vérifie-la dans les réglages.',no_credit:'Plus de crédit sur ton compte API Anthropic.',network:'Pas de connexion internet : saisis les valeurs à la main.',api_error:'Erreur de l’API Anthropic. Réessaie.',rate_limited:'Trop de demandes d’un coup. Réessaie dans un moment.',image_rejected:'Photo illisible. Essaie une photo plus nette et bien cadrée.',invalid_json:'Réponse illisible. Réessaie.',session_expired:'Reconnecte-toi à Claude puis réessaie.',images_unavailable:'La lecture de photo n’est pas disponible ici.'})[code]||'La lecture a échoué. Réessaie.'}

let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200)}
// sheetOff : nettoyage à faire quand la feuille se ferme ou change de contenu (ex. couper la caméra)
let sheetOff=null;
function sheetClean(){if(sheetOff){const f=sheetOff;sheetOff=null;try{f()}catch(e){}}}
function sheet(html){sheetClean();const s=$('#sheet');s.innerHTML=`<div class="sheet-in" role="dialog" aria-modal="true"><button class="iconbtn close" data-act="close" aria-label="Fermer">${ic('x')}</button>${html}</div>`;s.hidden=false;document.body.classList.add('lock')}
let scanCtl=null;
function closeSheet(){sheetClean();if(scanCtl){scanCtl.abort();scanCtl=null}const s=$('#sheet');s.hidden=true;s.innerHTML='';document.body.classList.remove('lock')}
function readURL(f){return new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>res('');r.readAsDataURL(f)})}
function shrink(file,max=1280){return new Promise(res=>{readURL(file).then(u=>{if(!u)return res(null);const img=new Image();img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};img.onerror=()=>res(u);img.src=u})})}

// ===== Aujourd'hui =====
function ring(v,t,col,big,small,lab){const C=2*Math.PI*40,f=Math.max(0,Math.min(v/(t||1),1));return `<div class="ring"><svg viewBox="0 0 96 96" width="106" height="106" role="img" aria-label="${lab} : ${big} sur ${small}"><circle cx="48" cy="48" r="40" fill="none" stroke="var(--card2)" stroke-width="9"/>${f>0?`<circle cx="48" cy="48" r="40" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 48 48)"/>`:''}<text x="48" y="47" text-anchor="middle" class="rv">${big}</text><text x="48" y="63" text-anchor="middle" class="rt">/ ${small}</text></svg><span>${lab}</span></div>`}
function coachText(){const t=dayTotals(),P=S.profile,h=new Date().getHours();const rk=Math.max(0,r0(P.kcal-t.kcal)),rp=r0(P.prot-t.prot);const parts=[];
const nMeals=S.meals.filter(m=>m.date===dk()).length;
if(!nMeals)parts.push(h<11?'Scanne ton petit-déj dès que tu manges.':'Aucun repas noté aujourd’hui : scanne ce que tu manges.');
else if(rp>0)parts.push(`Il te manque <b class="k">${fmtN(rk)} kcal</b> et <b class="p">${rp} g de protéines</b>.`+(rp>=40?' Mise sur du poulet, du thon, des œufs ou du fromage blanc.':''));
else if(rk>0)parts.push(`Protéines validées. Encore <b class="k">${fmtN(rk)} kcal</b> pour ta prise de masse.`);
else parts.push('Objectifs du jour atteints. Bien joué.');
const act=activeSession(),todayPlan=S.plans.find(p=>p.date===dk()),doneToday=S.sessions.some(s=>s.done&&s.date===dk());
if(act)parts.push(isStale(act)?'Tu as une séance restée ouverte : termine-la dans l’onglet Salle.':'Séance en cours, lâche rien.');
else if(doneToday)parts.push('Séance faite aujourd’hui, récupère bien.');
else if(todayPlan)parts.push(`Séance ${groupsLabel(todayPlan.groups).toLowerCase()} prévue à ${todayPlan.time}.`);
else{const g=suggestGroups()[0],d=daysSince(g);parts.push(d==null?`Pas encore de séance ${GN[g].toLowerCase()} enregistrée : c’est le moment.`:`Ça fait ${d} jour${d>1?'s':''} sans ${GN[g].toLowerCase()} : c’est le moment.`)}
const ms=missedPlans();if(ms.length&&!act)parts.push(`Séance ${groupsLabel(ms[0].groups).toLowerCase()} ratée ${fmtDay(ms[0].date)} : reporte-la dans Planifier.`);
if(h>=20){const b=bedtimes();parts.push(`Au lit vers ${b[0]} pour un réveil frais à ${P.wake}.`)}
return parts.join(' ')}
// Jour affiché dans l'onglet Aujourd'hui (null = aujourd'hui) : sert à voir et corriger les jours passés
let VD=null;
const vd=()=>VD&&VD<dk()?VD:dk();
function daysStripHTML(){const P=S.profile,cur=vd(),end=diffDays(cur,dk())<=6?dk():cur;
return `<p class="lab">${end===dk()?'7 derniers jours':'7 jours jusqu’au '+fmtDay(end)}</p><div class="week">${Array.from({length:7},(_,k)=>{const d=addDays(end,k-6),t=dayTotals(d);return `<button class="wd ${d===cur?'today':''} ${t.kcal>=P.kcal*.9?'d':''}" data-act="dayset" data-day="${d}" aria-label="${fmtDayLong(d)} : ${r0(t.kcal)} kcal"><small>${JOURS[parseDk(d).getDay()].replace('.','')}</small><strong>${parseDk(d).getDate()}</strong><span>${t.kcal?fmtN(r0(t.kcal)):'—'}</span></button>`}).join('')}</div><p class="note" style="font-size:12px">Calories par jour, plein quand l’objectif est atteint à 90 %. Touche un jour pour le voir ou le corriger.</p>`}
function renderToday(){const day=vd(),past=day!==dk();const t=dayTotals(day),P=S.profile;const meals=S.meals.filter(m=>m.date===day).slice().reverse();const next=nextPlan(),sug=suggestGroups(),b=bedtimes(),lastNight=S.sleep.find(s=>s.date===dk()),act=activeSession();
let seanceTitle,seanceSub;if(act){seanceTitle=groupsLabel(act.groups);seanceSub='en cours'}else if(next){seanceTitle=groupsLabel(next.groups);seanceSub=(next.date===dk()?'aujourd’hui':fmtDay(next.date))+' à '+next.time}else{seanceTitle=groupsLabel(sug);seanceSub='suggérée par le coach'}
const daysNoExp=S.lastExport?Math.floor((Date.now()-S.lastExport)/864e5):null;const hasData=S.sessions.length+S.meals.length>0;const showBk=!past&&hasData&&(daysNoExp===null||daysNoExp>=7)&&Date.now()>(S.snoozeExport||0);
$('#v-today').innerHTML=`${showBk?`<div class="card bk"><p><strong>Sauvegarde ${daysNoExp===null?'jamais faite':'vieille de '+daysNoExp+' jours'}</strong></p><p class="note" style="margin-top:2px">Tes données vivent uniquement sur ce téléphone. Un export prend 5 secondes.</p><div class="actions" style="margin:8px 0 0"><button class="btn ghost" data-act="bklater">Plus tard</button><button class="btn primary" data-act="export">Exporter</button></div></div>`:''}<header class="top"><div><div class="daynav"><button class="iconbtn sm" data-act="daynav" data-d="-1" aria-label="Jour précédent">${ic('chevl',20)}</button><p class="date">${fmtDayLong(day)}</p><button class="iconbtn sm" data-act="daynav" data-d="1" aria-label="Jour suivant" ${past?'':'disabled'}>${ic('chev',20)}</button></div><h1>${past?'Repas du '+fmtDay(day):'Objectif : prise de masse'}</h1></div><button class="iconbtn" data-act="settings" aria-label="Réglages">${ic('gear',22)}</button></header>
<div class="rings">${ring(t.kcal,P.kcal,'var(--acc)',fmtN(r0(t.kcal)),fmtN(P.kcal),'kcal')}${ring(t.prot,P.prot,'var(--prot)',r0(t.prot)+' g',P.prot+' g','protéines')}</div>
<div class="macros"><span>Glucides <b>${r0(t.carb)}</b> / ${P.carb} g</span><span>Lipides <b>${r0(t.fat)}</b> / ${P.fat} g</span></div>
${past?`<p class="note" style="margin-bottom:12px">Tu regardes un jour passé : ce que tu ajoutes ici est compté sur ce jour. <button class="link" data-act="dayset" data-day="${dk()}">Revenir à aujourd’hui</button></p>`:`<div class="coach"><div class="avatar">${ic('bolt',17)}</div><div class="bubble"><p>${coachText()}</p>${sampleOK?`<button class="link" data-act="mealidea">Une idée de repas ?</button><div id="idea"></div>`:''}</div></div>
<div class="duo"><button class="card mini" data-act="gotogym"><span class="lab0 acc">Séance</span><strong>${seanceTitle}</strong><small>${seanceSub}</small></button>
<button class="card mini" data-act="sleep"><span class="lab0 sl">${ic('moon',13)} Sommeil</span><strong>Coucher ${b[0]}</strong><small>${lastNight?'cette nuit : '+fmtH(lastNight.hours):'réveil '+P.wake+', 5 cycles'}</small></button></div>`}
<div class="actions">${sampleFn&&!imgOK?`<button class="btn primary" data-act="textscan">${ic('camera')} Étiquette</button>`:`<label class="btn primary" for="scanInput" role="button">${ic('camera')} Photo du repas</label>`}<button class="btn ghost" data-act="barcode">${ic('barcode')} Code-barres</button></div>
<p class="lab" style="margin-top:0">Ajout rapide</p><div class="chips qa"><button class="chip" data-act="whey">${ic('plus',14)} Whey</button>${(S.favs||[]).map(f=>`<button class="chip" data-act="addfav" data-id="${f.id}">${ic('plus',14)} ${esc(f.name)}</button>`).join('')}</div>${(S.favs||[]).length?'':'<p class="note" style="margin-top:-2px">Touche l’étoile d’un repas pour l’ajouter ici en favori.</p>'}
<section><div class="sh"><h2>${past?'Repas notés':'Repas du jour'}</h2><span>${sampleOK?'<button class="link" data-act="textscan">Coller une étiquette</button>':''}<button class="link" style="margin-left:14px" data-act="manual">À la main</button></span></div>
${meals.length?meals.map(m=>`<div class="row"><button class="rowbtn grow" data-act="editmeal" data-id="${m.id}" aria-label="Modifier ${esc(m.name)}"><strong>${esc(m.name)}</strong><small>${r0(m.kcal)} kcal, ${r0(m.prot)} g de protéines${m.grams?', '+r0(m.grams)+' g':''}</small></button><button class="iconbtn sm ${isFav(m)?'fav':''}" data-act="favmeal" data-id="${m.id}" aria-label="${isFav(m)?'Retirer des favoris':'Ajouter aux favoris'}" aria-pressed="${isFav(m)}">${ic('star',17)}</button><button class="iconbtn sm" data-act="delmeal" data-id="${m.id}" aria-label="Supprimer ${esc(m.name)}">${ic('x',16)}</button></div>`).join(''):`<p class="empty">${past?'Rien de noté ce jour-là.':'Rien pour l’instant. Photographie ton plat ou scanne un code-barres.'}</p>`}${meals.length?'<p class="note" style="font-size:12px">Touche un repas pour le modifier.</p>':''}</section>
${daysStripHTML()}`}

const ACT={};
ACT.daynav=el=>{const d=addDays(vd(),+el.dataset.d);VD=d>=dk()?null:d;render()};
ACT.dayset=el=>{const d=el.dataset.day;VD=d>=dk()?null:d;render();window.scrollTo(0,0)};
ACT.editmeal=el=>{const m=S.meals.find(x=>x.id===el.dataset.id);if(m)mealForm(Object.assign({},m))};ACT.close=closeSheet;
ACT.gotogym=()=>{setTab('gym')};
ACT.scan=()=>$('#scanInput').click();
ACT.manual=()=>mealForm({});
const favKey=s=>String(s||'').trim().toLowerCase();
function isFav(m){return (S.favs||[]).some(f=>favKey(f.name)===favKey(m.name))}
ACT.favmeal=el=>{const m=S.meals.find(x=>x.id===el.dataset.id);if(!m)return;S.favs=S.favs||[];if(isFav(m)){S.favs=S.favs.filter(f=>favKey(f.name)!==favKey(m.name));toast('Retiré des favoris')}else{S.favs.push({id:uid(),name:m.name,grams:m.grams,kcal:m.kcal,prot:m.prot,carb:m.carb,fat:m.fat});toast('Ajouté aux favoris')}save();render()};
ACT.addfav=el=>{const f=(S.favs||[]).find(x=>x.id===el.dataset.id);if(!f)return;S.meals.push({id:uid(),date:vd(),name:f.name,grams:f.grams,kcal:f.kcal,prot:f.prot,carb:f.carb,fat:f.fat});save();render();toast(f.name+' ajouté : +'+r0(f.prot)+' g de protéines')};
ACT.bklater=()=>{S.snoozeExport=Date.now()+3*864e5;save();render()};
ACT.whey=()=>{const P=S.profile;S.meals.push({id:uid(),date:vd(),name:'Shaker whey (31 g)',grams:31,kcal:+P.wkcal||0,prot:+P.wprot||0,carb:+P.wcarb||0,fat:+P.wfat||0});save();render();toast('Whey ajoutée : +'+r0(P.wprot)+' g de protéines')};
ACT.delmeal=el=>{S.meals=S.meals.filter(m=>m.id!==el.dataset.id);save();render();toast('Repas supprimé')};
function scanPrompt(src){const t=dayTotals(vd()),P=S.profile;return `Tu es le coach nutrition d'un étudiant de ${P.age} ans, ${P.kg} kg, ${P.cm} cm, en prise de masse musculaire. Objectifs du jour : ${P.kcal} kcal, ${P.prot} g de protéines, ${P.carb} g de glucides, ${P.fat} g de lipides. Déjà mangé aujourd'hui : ${r0(t.kcal)} kcal, ${r0(t.prot)} g de protéines, ${r0(t.carb)} g de glucides, ${r0(t.fat)} g de lipides.
${src}
Si c'est une étiquette : lis les valeurs pour 100 g, et le poids net ou la portion si c'est visible (sinon estime une portion réaliste).
Si c'est un plat : estime la portion et les valeurs totales.
Réponds uniquement avec un objet JSON, par exemple :
{"nom":"Taboulé","type":"etiquette","pour100g":{"kcal":150,"proteines":4,"glucides":22,"lipides":5},"portion_g":300,"total":null,"avis":"..."}
Pour un plat : "type":"plat", "pour100g":null et "total":{"kcal":..,"proteines":..,"glucides":..,"lipides":..}.
"verdict" : "tres_bien" si le repas aide vraiment sa prise de masse (assez de calories et au moins 25 g de protéines pour un repas), "a_completer" s'il est correct mais insuffisant, "a_changer" s'il est vraiment pauvre ou déséquilibré (très peu de protéines, surtout du sucre ou du gras).
"avis" : une phrase courte en français, en tutoyant, directe et exigeante sur les calories et les protéines : ce qui va ou ne va pas.
"conseil" : une phrase concrète en tutoyant : quoi ajouter à ce repas ou quoi prendre à la place (par exemple « ajoute deux œufs ou un yaourt grec »). Si c'est très bien, dis quoi garder.
Exemple complet : {"nom":"Taboulé","type":"etiquette","pour100g":{"kcal":150,"proteines":4,"glucides":22,"lipides":5},"portion_g":300,"total":null,"verdict":"a_completer","avis":"Bonne base de glucides, mais 12 g de protéines, c'est bien trop peu pour un repas.","conseil":"Ajoute une boîte de thon ou du poulet pour monter à 35 g de protéines."}
Si l'image n'est ni une étiquette ni un plat : {"erreur":"explication courte"}.`}
function handleScan(d,url){if(!d||typeof d!=='object')throw{code:'invalid_json'};
if(d.erreur){const st=$('#scanStatus');if(st){st.classList.remove('thinking');st.innerHTML=esc(d.erreur)+` <button class="link" data-act="manual">Saisir à la main</button>`}return}
const g=num(d.portion_g)||100;const p100=d.pour100g&&typeof d.pour100g==='object'?{kcal:num(d.pour100g.kcal),proteines:num(d.pour100g.proteines),glucides:num(d.pour100g.glucides),lipides:num(d.pour100g.lipides)}:null;
let tot=d.total&&typeof d.total==='object'?{kcal:num(d.total.kcal),proteines:num(d.total.proteines),glucides:num(d.total.glucides),lipides:num(d.total.lipides)}:null;
if(p100)tot={kcal:p100.kcal*g/100,proteines:p100.proteines*g/100,glucides:p100.glucides*g/100,lipides:p100.lipides*g/100};
mealForm({name:d.nom,grams:g,kcal:tot&&tot.kcal,prot:tot&&tot.proteines,carb:tot&&tot.glucides,fat:tot&&tot.lipides,p100,avis:d.avis,conseil:d.conseil,verdict:d.verdict},null,url)}
function scanFail(err,url){scanCtl=null;if(err&&err.code==='cancelled')return;if(err&&err.code==='images_unavailable'){imgOK=false;textScan(url);return}const st=$('#scanStatus');if(st){st.classList.remove('thinking');st.innerHTML=esc(errMsg(err&&err.code))+` <button class="link" data-act="manual">Saisir à la main</button>`}}
function textScan(url){sheet(`<h2>Scanner l’étiquette</h2>${url?`<img class="prev sm" src="${url}" alt="Photo de l’étiquette">`:''}
<ol class="cues" style="margin-top:4px"><li>Touche la case ci-dessous : le clavier s’ouvre. <strong>Touche-la une 2e fois</strong> (ou appui long dans la case) pour faire apparaître le menu, puis choisis <strong>« Scanner du texte »</strong>.</li><li>Vise le tableau nutritionnel, puis appuie sur <strong>« Insérer »</strong>.</li><li>Corrige un chiffre si besoin, et appuie sur Analyser.</li></ol>
<p class="note" style="margin-top:-6px">Autre option : ouvre une photo dans l’app Photos, appuie longuement sur le texte, « Copier », puis colle-le ici.</p>
<form id="txF" class="form" novalidate><label>Texte de l’étiquette<textarea name="tx" rows="6" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Touche ici puis « Scanner du texte »"></textarea></label><label>Ce que c’est (facultatif)<input name="what" autocomplete="off" placeholder="Yaourt nature, pot de 125 g"></label><button class="btn primary full" type="submit">Analyser</button></form><p class="thinking" id="scanStatus" hidden>Je lis les valeurs…</p>
<p class="note">Tu peux aussi taper les valeurs toi-même, l’analyse marche pareil. <button class="link" data-act="manual">Saisie classique</button></p>`);
const f=$('#txF');f.addEventListener('submit',async ev=>{ev.preventDefault();const tx=f.elements.tx.value.trim();if(tx.length<8){toast('Colle le texte de l’étiquette');return}const st=$('#scanStatus');st.hidden=false;f.querySelector('button[type="submit"]').disabled=true;
const ctl=new AbortController();scanCtl=ctl;const what=f.elements.what.value.trim();
try{const d=await sampleFn.json(scanPrompt(`Voici le texte copié d'une étiquette de valeurs nutritionnelles${what?` (produit : ${what})`:''}. Le texte peut être désordonné : retrouve les valeurs pour 100 g et la portion ou le poids net s'ils y figurent. Texte :\n"""\n${tx.slice(0,3000)}\n"""`),{signal:ctl.signal});scanCtl=null;handleScan(d,url)}catch(err){scanFail(err,url);const b=f.querySelector('button[type="submit"]');if(b)b.disabled=false}})}
ACT.textscan=()=>{if(!sampleFn){mealForm({},'La lecture par Claude n’est pas disponible ici.');return}textScan(null)};
$('#scanInput').addEventListener('change',async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
const url=await shrink(f,900);
if(!sampleFn){mealForm({},window.claude?"L’app n’a pas accès à Claude ici. Ouvre-la depuis ton lien claude.ai en étant connecté, puis accepte l’autorisation. En attendant, saisis les valeurs à la main.":"Pour activer la lecture automatique, ajoute ta clé API Anthropic dans les réglages (roue en haut). En attendant, saisis les valeurs à la main.",url);return}
if(!imgOK){textScan(url);return}
sheet(`<h2>Analyse</h2>${url?`<img class="prev" src="${url}" alt="Photo à analyser">`:''}<p class="thinking" id="scanStatus">Je lis les valeurs…</p>`);
const ctl=new AbortController();scanCtl=ctl;
try{const d=await sampleFn.json(scanPrompt("L'image est soit une étiquette de valeurs nutritionnelles (emballage), soit la photo d'un plat."),{images:f,signal:ctl.signal});scanCtl=null;handleScan(d,url)}catch(err){scanFail(err,url)}});
// v.id présent : on modifie un repas existant au lieu d'en ajouter un
function mealForm(v,note,img){const day=v.id?v.date:vd();const own=v.id?{kcal:+v.kcal||0,prot:+v.prot||0}:{kcal:0,prot:0};const val=x=>x!=null&&x!==''?String(Math.round(x*10)/10).replace('.',','):'';
sheet(`<h2>${v.id?'Modifier le repas':v.name?esc(v.name):'Ajouter un repas'}</h2>${img?`<img class="prev sm" src="${img}" alt="">`:''}${note?`<p class="note">${esc(note)}</p>`:''}${day!==dk()?`<p class="note">Compté sur ${fmtDayLong(day).toLowerCase()}.</p>`:''}${v.verdict||v.avis?`<div class="verdict ${({tres_bien:'vg',a_completer:'vm',a_changer:'vb'})[v.verdict]||'vm'}"><p class="vlab">${({tres_bien:'Très bien',a_completer:'À compléter',a_changer:'À changer'})[v.verdict]||'Avis du coach'}</p>${v.avis?`<p>${esc(v.avis)}</p>`:''}${v.conseil?`<p class="vtip">${ic('bolt',14)} ${esc(v.conseil)}</p>`:''}</div>`:''}<div id="after" class="note"></div>
<form id="mealF" class="form" novalidate><label>Nom<input name="nm" autocomplete="off" value="${esc(v.name||'')}" placeholder="Sandwich poulet"></label>
<label>Quantité mangée (g)${v.p100?' : les valeurs se recalculent':''}<input name="grams" type="text" inputmode="decimal" value="${val(v.grams)}"></label>
<div class="grid2"><label>Calories<input name="kcal" type="text" inputmode="decimal" value="${val(v.kcal)}"></label><label>Protéines (g)<input name="prot" type="text" inputmode="decimal" value="${val(v.prot)}"></label><label>Glucides (g)<input name="carb" type="text" inputmode="decimal" value="${val(v.carb)}"></label><label>Lipides (g)<input name="fat" type="text" inputmode="decimal" value="${val(v.fat)}"></label></div>
<button class="btn primary full" type="submit">${v.id?'Enregistrer':v.name?'Ajouter à ma journée':'Enregistrer le repas'}</button></form>`);
const F=$('#mealF').elements;
const after=()=>{const t=dayTotals(day),P=S.profile;const rk=r0(P.kcal-t.kcal+own.kcal-num(F.kcal.value)),rp=r0(P.prot-t.prot+own.prot-num(F.prot.value));const o=$('#after');if(o)o.innerHTML=num(F.kcal.value)?`Après ce repas : il te restera <strong style="color:var(--acc)">${fmtN(Math.max(0,rk))} kcal</strong> et <strong style="color:var(--prot)">${Math.max(0,rp)} g de protéines</strong> pour la journée.`:''};after();['kcal','prot','grams'].forEach(k=>F[k].addEventListener('input',()=>setTimeout(after,0)));
if(v.p100)F.grams.addEventListener('input',()=>{const g=num(F.grams.value);F.kcal.value=r0(v.p100.kcal*g/100);F.prot.value=r0(v.p100.proteines*g/100);F.carb.value=r0(v.p100.glucides*g/100);F.fat.value=r0(v.p100.lipides*g/100)});
$('#mealF').addEventListener('submit',e=>{e.preventDefault();const kcal=num(F.kcal.value);if(!kcal){toast('Indique au moins les calories');return}
const m={name:F.nm.value.trim()||'Repas',grams:num(F.grams.value)||null,kcal,prot:num(F.prot.value),carb:num(F.carb.value),fat:num(F.fat.value)};if(v.p100)m.p100=v.p100;
const old=v.id&&S.meals.find(x=>x.id===v.id);if(old)Object.assign(old,m);else S.meals.push(Object.assign({id:uid(),date:day},m));save();closeSheet();render();toast(old?'Repas modifié':'Repas enregistré')})}ACT.mealidea=async el=>{const box=$('#idea');if(!box||!sampleFn)return;el.disabled=true;box.innerHTML='<p class="thinking">Je réfléchis…</p>';const t=dayTotals(),P=S.profile,h=new Date().getHours();const moment=h<11?'petit-déjeuner':h<15?'déjeuner':h<18?'goûter':'dîner';
const prompt=`Étudiant de ${P.age} ans en prise de masse, peu de temps et petit budget. Il lui reste aujourd'hui ${Math.max(0,r0(P.kcal-t.kcal))} kcal et ${Math.max(0,r0(P.prot-t.prot))} g de protéines. Propose 3 idées de ${moment} simples : prêtes en moins de 15 minutes ou achetables en supermarché en France. Réponds uniquement avec un tableau JSON : [{"plat":"...","kcal":600,"proteines":40,"comment":"une phrase courte en tutoyant"}]`;
try{const arr=await sampleFn.json(prompt,{modelTier:'quick',cache:false});const b2=$('#idea');if(!b2)return;b2.innerHTML=(Array.isArray(arr)?arr:[]).slice(0,3).map(i=>`<div class="idea"><strong>${esc(i.plat)}</strong><small>${r0(i.kcal)} kcal, ${r0(i.proteines)} g de protéines</small><p>${esc(i.comment||'')}</p></div>`).join('')||'<p class="note">Pas d’idée reçue. Réessaie.</p>'}
catch(err){const b2=$('#idea');if(b2)b2.innerHTML=`<p class="note">${esc(errMsg(err&&err.code))}</p>`}finally{el.disabled=false}};

// Sommeil
ACT.sleep=()=>{const last=S.sleep.find(s=>s.date===dk());const tomorrowPlan=S.plans.find(p=>p.date===addDays(dk(),1));
sheet(`<h2>Sommeil</h2><form id="slF" class="form" novalidate><label>Cette nuit, j’ai dormi (heures)<input name="h" type="text" inputmode="decimal" value="${last?String(last.hours).replace('.',','):''}" placeholder="7,5"></label><label>Demain je me lève à<input name="wake" type="time" value="${S.profile.wake}"></label><div id="bedOut"></div><button class="btn primary full" type="submit">Enregistrer</button></form>`);
const f=$('#slF'),F=f.elements;const upd=()=>{const bb=bedtimes(F.wake.value||S.profile.wake);$('#bedOut').innerHTML=`<p class="lab">Heure de coucher conseillée</p><div class="bed"><div><strong>${bb[0]}</strong><small>5 cycles, 7h30</small></div><div><strong>${bb[1]}</strong><small>6 cycles, 9h</small></div></div><p class="note">Les 15 minutes pour t’endormir sont incluses. Te réveiller en fin de cycle évite d’être dans le coaltar.${tomorrowPlan?' Séance demain : vise au moins 5 cycles complets.':''}</p>`};upd();F.wake.addEventListener('input',upd);
f.addEventListener('submit',e=>{e.preventDefault();const h=num(F.h.value);if(h>0&&h<16){S.sleep=S.sleep.filter(s=>s.date!==dk());S.sleep.push({date:dk(),hours:h})}if(F.wake.value)S.profile.wake=F.wake.value;save();closeSheet();render();toast('Sommeil enregistré')})};

// Planification
function planWarn(d,groups,selfId){for(const g of groups){if(g==='abdos')continue;const l=lastTrained(g,d);if(l&&diffDays(l,d)<=1)return `${GN[g]} travaillés il y a moins de 48 h : décale d’un jour ou change de muscle.`;const near=S.plans.find(p=>p.date>=dk()&&p.id!==selfId&&p.groups.includes(g)&&Math.abs(diffDays(p.date,d))<=1);if(near)return `${GN[g]} déjà prévus ${fmtDay(near.date)} : laisse 48 h entre deux séances du même muscle.`}return ''}
function upcomingList(){const ps=S.plans.filter(p=>p.date>=dk()).sort((a,b)=>(a.date+a.time)<(b.date+b.time)?-1:1);if(!ps.length)return '';return `<p class="lab">Déjà planifiées</p>`+ps.map(p=>`<div class="row"><div class="grow"><strong>${p.style?STYLES[p.style].n+' : ':''}${groupsLabel(p.groups)}</strong><small>${fmtDay(p.date)} à ${p.time}${p.exercises&&p.exercises.length?', '+p.exercises.length+' exercices':''}</small></div><button class="link" data-act="editplan" data-id="${p.id}">Modifier</button><button class="link" style="color:var(--bad);margin-left:10px" data-act="delplan" data-id="${p.id}">Annuler</button></div>`).join('')}
const PRIO=['pecs','dos','epaules','jambes','bras','abdos'];
const progList=(g,st)=>g.length&&st?getProgram(g,st).map(e=>({exId:e.exId,rx:e.rx})):[];
let PD=null;
let PDdone=null;
function openPlanEditor(p,day){PDdone=null;if(p){PD={id:p.id,date:day||p.date,time:p.time,groups:p.groups.slice(),style:p.style||null,exercises:(p.exercises||[]).map(e=>({exId:e.exId,rx:e.rx})),gT:true}}else{const d0=day||addDays(dk(),1),g=suggestGroups(d0);PD={id:null,date:d0,time:'18:00',groups:g,style:recommendedStyle(g),exercises:[],gT:false};PD.exercises=progList(PD.groups,PD.style)}PD.pick=null;closeSheet();tab='plan';try{localStorage.setItem('coach-salle-tab','plan')}catch(e){}render();window.scrollTo(0,0)}
function drawPlan(){render()}
function planEditorHTML(){const P=PD;const w=P.date?planWarn(P.date,P.groups,P.id):'';const rec=P.groups.length?recommendedStyle(P.groups):null;
return `<header class="top"><h1>${P.id?'Modifier la séance':'Nouvelle séance'}</h1><button class="link" data-act="pdcancel">Annuler</button></header>
<p class="lab" style="margin-top:0">Dernier entraînement par muscle</p>${tilesHTML()}
<div class="form grid2"><label>Jour<input id="pdD" type="date" value="${P.date}" min="${dk()}"></label><label>Heure<input id="pdT" type="time" value="${P.time}"></label></div>
<p class="lab" style="margin-top:4px">Muscles</p><div class="chips">${GROUPS.map(([g,n])=>`<button type="button" class="chip ${P.groups.includes(g)?'on':''}" data-act="pdg" data-g="${g}" aria-pressed="${P.groups.includes(g)}">${n}</button>`).join('')}</div>
${w?`<p class="note warn">${w}</p>`:''}
${P.groups.length?`<p class="lab">Séance</p><div class="chips">${['A','B','C'].map(st=>`<button type="button" class="chip ${P.style===st?'on':''}" data-act="pds" data-st="${st}" aria-pressed="${P.style===st}">${STYLES[st].n}</button>`).join('')}</div><p class="note">${P.style?STYLES[P.style].d:''}${rec?' Le coach conseille la '+STYLES[rec].n.toLowerCase()+'.':''}</p>
<p class="lab">Exercices prévus</p>${P.exercises.map((e,i)=>`<div class="row"><div class="grow"><strong>${EXM[e.exId].n}</strong><small>${esc(e.rx)}</small></div><button class="link" data-act="pdrep" data-i="${i}">Changer</button><button class="iconbtn sm" data-act="pddel" data-i="${i}" aria-label="Retirer ${EXM[e.exId].n}">${ic('x',16)}</button></div>`).join('')||'<p class="empty">Aucun exercice pour l’instant.</p>'}<button class="link" data-act="pdadd">+ Ajouter un exercice</button>`:''}
<button class="btn primary full" data-act="pdsave" style="margin-top:18px">${P.id?'Enregistrer les changements':'Planifier cette séance'}</button>`}
function bindPlanEditor(){const P=PD;const d=$('#pdD'),t=$('#pdT');if(d)d.addEventListener('change',e=>{P.date=e.target.value;if(!P.gT&&P.date){P.groups=suggestGroups(P.date);P.style=recommendedStyle(P.groups);P.exercises=progList(P.groups,P.style)}render()});if(t)t.addEventListener('change',e=>{P.time=e.target.value})}
function drawPick(i){PD.pick=i;render();window.scrollTo(0,0)}
function planPickHTML(){const P=PD,i=P.pick;const used=new Set(P.exercises.map(e=>e.exId));const cur=i>=0?EXM[P.exercises[i].exId]:null;const row=x=>`<button class="row" data-act="pdpick" data-i="${i}" data-ex="${x.id}"><span class="pict sm">${pict(x.eq,24)}</span><span class="grow"><strong>${x.n}</strong><small>${x.m}</small></span></button>`;
const vars=cur?cur.v.map(id=>EXM[id]).filter(v=>v&&!used.has(v.id)):[];const order=[...P.groups,...PRIO.filter(g=>!P.groups.includes(g))];
return `<header class="top"><h1>${cur?'Remplacer':'Ajouter un exercice'}</h1><button class="link" data-act="pdback">Retour</button></header><button class="link" data-act="newex" data-ctx="plan" style="padding-top:0">+ Créer un exercice</button>${cur?'<p class="note" style="margin-top:0">'+cur.n+'</p>':''}${vars.length?'<p class="lab">Variantes conseillées</p>'+vars.map(row).join(''):''}`+order.map(g=>{const l=EX.filter(x=>x.g===g&&!used.has(x.id)&&!vars.includes(x));return l.length?`<p class="lab">${GN[g]}</p>`+l.map(row).join(''):''}).join('')}
ACT.plan=()=>openPlanEditor(null);
ACT.plannow=()=>openPlanEditor(null,dk());
ACT.editplan=el=>{const p=S.plans.find(x=>x.id===el.dataset.id);if(p)openPlanEditor(p)};
ACT.pdg=el=>{const g=el.dataset.g,P=PD;P.gT=true;P.groups=(P.groups.includes(g)?P.groups.filter(x=>x!==g):[...P.groups,g]).sort((x,y)=>PRIO.indexOf(x)-PRIO.indexOf(y));if(P.groups.length){if(!P.style)P.style=recommendedStyle(P.groups);P.exercises=progList(P.groups,P.style)}else P.exercises=[];drawPlan()};
ACT.pds=el=>{PD.style=el.dataset.st;PD.exercises=progList(PD.groups,PD.style);drawPlan()};
ACT.pddel=el=>{PD.exercises.splice(+el.dataset.i,1);drawPlan()};
ACT.pdrep=el=>drawPick(+el.dataset.i);
ACT.pdadd=()=>drawPick(-1);
ACT.pdback=()=>{PD.pick=null;render();window.scrollTo(0,0)};
ACT.pdcancel=()=>{PD=null;render();window.scrollTo(0,0)};
function pdPickApply(i,id){PD.pick=null;if(i>=0){const e=PD.exercises[i];const same=EXM[e.exId].g===EXM[id].g;e.exId=id;if(!same)e.rx=rxFor(id,false)}else PD.exercises.push({exId:id,rx:rxFor(id,false)})}
ACT.pdpick=el=>{pdPickApply(+el.dataset.i,el.dataset.ex);render();window.scrollTo(0,0)};
ACT.pdsave=()=>{const P=PD;if(!P.groups.length){toast('Choisis au moins un muscle');return}if(!P.date){toast('Choisis un jour');return}const p={id:P.id||uid(),date:P.date,time:P.time||'18:00',groups:P.groups.slice(),style:P.style,exercises:P.exercises.map(e=>({exId:e.exId,rx:e.rx}))};const was=!!P.id;S.plans=S.plans.filter(x=>x.id!==p.id);S.plans.push(p);PD=null;PDdone=was?null:p.id;save();render();window.scrollTo(0,0);toast(was?'Séance modifiée':'Séance planifiée')};
ACT.delplan=el=>{S.plans=S.plans.filter(p=>p.id!==el.dataset.id);if(PDdone===el.dataset.id)PDdone=null;save();render();toast('Séance annulée')};
ACT.pddone=()=>{PDdone=null;render()};
function evTimes(p){const[h,m]=p.time.split(':').map(Number);const s=parseDk(p.date);s.setHours(h,m,0,0);const e=new Date(s.getTime()+90*6e4);const f=d=>dk(d).replace(/-/g,'')+'T'+pad(d.getHours())+pad(d.getMinutes())+'00';return[f(s),f(e)]}
function gcalUrl(p){const[a,b]=evTimes(p);let tz='Europe/Paris';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||tz}catch(e){}return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('Salle : '+groupsLabel(p.groups))+'&dates='+a+'/'+b+'&ctz='+encodeURIComponent(tz)+'&details='+encodeURIComponent((p.exercises||[]).map(e=>EXM[e.exId].n+' : '+e.rx).join('\n')||'Séance planifiée avec Coach Salle')}
const icsEsc=s=>String(s).replace(/([,;\\])/g,'\\$1');
function icsText(p){const[a,b]=evTimes(p);return['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Coach Salle//FR','BEGIN:VEVENT','UID:'+p.id+'@coach-salle','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART:'+a,'DTEND:'+b,'SUMMARY:Salle : '+groupsLabel(p.groups),'DESCRIPTION:'+(p.exercises||[]).map(e=>icsEsc(EXM[e.exId].n+' '+e.rx)).join('\\n'),'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:Séance dans 30 minutes','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n')}
function calHTML(p){return framed?`<a class="btn primary full" target="_blank" rel="noopener" href="${gcalUrl(p)}">${ic('calendar')} Ajouter à Google Agenda</a>`:`<button class="btn primary full" data-act="ics" data-id="${p.id}">${ic('calendar')} Ajouter à l’agenda de l’iPhone</button>`}
// Ajout à l'agenda. Sur iPhone, une app installée sur l'écran d'accueil ne gère pas bien les téléchargements :
// on essaie d'abord d'ouvrir le fichier d'agenda directement (l'iPhone propose « Ajouter au calendrier »).
// Si rien ne se passe, l'utilisateur peut essayer une autre méthode ; celle qui a servi en dernier est retenue.
const CALM=['data','share','file'];
function calDo(p,mode){const txt=icsText(p),blob=new Blob([txt],{type:'text/calendar'});
if(mode==='share'){try{const f=new File([blob],'seance.ics',{type:'text/calendar'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(()=>{});return}}catch(e){}mode='file'}
if(mode==='data'){window.open('data:text/calendar;charset=utf-8,'+encodeURIComponent(txt),'_blank');return}
dlBlob(blob,'seance.ics')}
function calSheet(p,mode){const k=CALM.indexOf(mode);sheet(`<h2>Ajout à l’agenda</h2><p>${mode==='share'?'Dans la feuille de partage, choisis Calendrier s’il est proposé, sinon « Enregistrer dans Fichiers » puis ouvre le fichier.':'L’iPhone doit te proposer d’ajouter la séance à Calendrier, avec un rappel 30 minutes avant.'}</p><p class="note">${groupsLabel(p.groups)}, ${fmtDay(p.date)} à ${p.time}. Méthode ${k+1} sur ${CALM.length}.</p><button class="btn primary full" data-act="close">C’est ajouté</button><button class="btn ghost full" data-act="icsalt" data-id="${p.id}">Rien ne s’est passé : essayer autrement</button>`)}
ACT.ics=el=>{const p=S.plans.find(x=>x.id===el.dataset.id);if(!p)return;if(!IOS){dlBlob(new Blob([icsText(p)],{type:'text/calendar'}),'seance.ics');return}
const mode=CALM.includes(S.profile.calMode)?S.profile.calMode:'data';calDo(p,mode);calSheet(p,mode)};
ACT.icsalt=el=>{const p=S.plans.find(x=>x.id===el.dataset.id);if(!p)return;const cur=CALM.includes(S.profile.calMode)?S.profile.calMode:'data';const mode=CALM[(CALM.indexOf(cur)+1)%CALM.length];S.profile.calMode=mode;save();calDo(p,mode);calSheet(p,mode)};
