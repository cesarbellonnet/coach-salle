"use strict";
const K='coach-salle-v1';
const GROUPS=[['pecs','Pecs'],['dos','Dos'],['epaules','Épaules'],['bras','Bras'],['jambes','Jambes'],['abdos','Abdos']];
const GN=Object.fromEntries(GROUPS);
const PAIR={pecs:['pecs','bras'],dos:['dos','bras'],epaules:['epaules','abdos'],jambes:['jambes','abdos'],bras:['bras','epaules'],abdos:['abdos','jambes']};

// Bibliothèque d'exercices : eq = type de matériel, m = où / quelle machine, c = consignes, v = variantes
const EX=[
{id:'dc',n:'Développé couché',g:'pecs',eq:'barre',m:'Banc plat et barre olympique',c:['Omoplates serrées et plaquées sur le banc, pieds bien au sol.','Descends la barre au bas des pecs, coudes à environ 45° du corps.','Pousse en soufflant, sans décoller les fesses.'],v:['dci','smith','dch']},
{id:'dch',n:'Développé couché haltères',g:'pecs',eq:'halteres',m:'Banc plat et deux haltères',c:['Haltères au niveau de la poitrine, paumes vers les pieds.','Descends lentement pour bien étirer les pecs.','Remonte en rapprochant légèrement les haltères en haut.'],v:['dc','dci']},
{id:'dci',n:'Développé incliné haltères',g:'pecs',eq:'halteres',m:'Banc incliné à 30° environ',c:['Banc à 30°, pas plus, sinon ce sont les épaules qui bossent.','Descends les haltères sur le haut des pecs.','Contracte la poitrine en haut sans cogner les haltères.'],v:['dc','smith']},
{id:'smith',n:'Développé à la Smith machine',g:'pecs',eq:'machine',m:'Barre guidée sur rails verticaux',c:['Place le banc pour que la barre tombe au bas des pecs.','Déverrouille en tournant les poignets, descends contrôlé.','Pratique pour pousser lourd sans pareur.'],v:['dc','dci']},
{id:'pecfly',n:'Pec fly (machine)',g:'pecs',eq:'machine',m:'Machine à bras qui se referment devant toi',c:['Dos collé au dossier, poignées à hauteur de poitrine.','Referme les bras comme pour enlacer un tronc d’arbre.','Tiens une seconde en contractant, reviens lentement.'],v:['vis','dch']},
{id:'vis',n:'Écartés à la poulie vis-à-vis',g:'pecs',eq:'poulie',m:'Deux poulies hautes face à face',c:['Un pied en avant, buste légèrement penché.','Ramène les poignées devant toi, coudes légèrement fléchis.','Croise un peu les mains en bas pour finir la contraction.'],v:['pecfly']},
{id:'pompes',n:'Pompes',g:'pecs',eq:'corps',m:'Au sol, sans matériel',c:['Mains un peu plus larges que les épaules, corps gainé.','Descends la poitrine près du sol.','Si c’est trop facile, surélève les pieds.'],v:['dc','dips']},
{id:'dips',s:'tri',n:'Dips',g:'bras',eq:'corps',m:'Barres parallèles',c:['Buste droit pour cibler les triceps, penché pour les pecs.','Descends jusqu’à ce que les coudes forment un angle droit.','Remonte sans verrouiller brutalement les coudes.'],v:['ext','front']},
{id:'ext',s:'tri',n:'Extension triceps à la poulie',g:'bras',eq:'poulie',m:'Poulie haute avec barre ou corde',c:['Coudes collés au corps, ils ne bougent pas.','Pousse vers le bas jusqu’à bras tendus.','Remonte lentement jusqu’à hauteur de poitrine.'],v:['front','dips']},
{id:'front',s:'tri',n:'Barre au front',g:'bras',eq:'barre',m:'Banc plat et barre EZ (barre ondulée)',c:['Allongé, barre au-dessus de la poitrine, bras tendus.','Plie seulement les coudes pour amener la barre vers le front.','Garde les coudes serrés vers l’intérieur.'],v:['ext']},
{id:'curl',s:'bi',n:'Curl barre',g:'bras',eq:'barre',m:'Barre droite ou EZ, debout',c:['Coudes collés au corps, dos droit.','Monte la barre sans balancer le buste.','Descends lentement, c’est là que le biceps travaille le plus.'],v:['curlh','marteau']},
{id:'curlh',s:'bi',n:'Curl haltères',g:'bras',eq:'halteres',m:'Deux haltères, debout ou assis',c:['Tourne le poignet vers l’extérieur en montant.','Alterne les bras ou monte les deux ensemble.','Pas d’élan : si tu balances, allège.'],v:['curl','marteau']},
{id:'marteau',s:'bi',n:'Curl marteau',g:'bras',eq:'halteres',m:'Deux haltères, prise neutre',c:['Pouces vers le haut pendant tout le mouvement.','Travaille le biceps et l’avant-bras.','Coudes fixes, montée contrôlée.'],v:['curlh']},
{id:'overhead',s:'tri',n:'Extension nuque haltère',g:'bras',eq:'halteres',m:'Un haltère tenu à deux mains, assis',c:['Haltère derrière la tête, coudes pointés vers le plafond.','Tends les bras vers le haut sans écarter les coudes.','Descends lentement pour bien étirer le triceps.'],v:['ext','front']},
{id:'pupitre',s:'bi',n:'Curl au pupitre',g:'bras',eq:'machine',m:'Pupitre à biceps (banc Larry Scott) ou machine',c:['Bras bien posés sur le pupitre, aisselles calées.','Monte sans décoller les coudes.','Ne tends pas brutalement les bras en bas.'],v:['curl','curlh']},
{id:'tractions',n:'Tractions',g:'dos',eq:'corps',m:'Barre fixe',c:['Prise un peu plus large que les épaules.','Tire la poitrine vers la barre en serrant les omoplates.','Si c’est trop dur, utilise la machine d’assistance.'],v:['tvert']},
{id:'tvert',n:'Tirage vertical',g:'dos',eq:'poulie',m:'Poulie haute assise (lat pulldown)',c:['Cuisses bloquées sous les boudins.','Tire la barre vers le haut de la poitrine, pas derrière la nuque.','Pense à ramener les coudes vers tes poches.'],v:['tractions','pullover']},
{id:'thori',n:'Tirage horizontal',g:'dos',eq:'poulie',m:'Poulie basse assise, poignée triangle',c:['Dos droit, légère cambrure.','Tire la poignée vers le nombril en serrant les omoplates.','Ne te penche pas en arrière pour tricher.'],v:['rowing']},
{id:'rowing',n:'Rowing haltère',g:'dos',eq:'halteres',m:'Un haltère, genou et main sur un banc',c:['Dos plat, parallèle au sol.','Tire l’haltère vers la hanche, coude près du corps.','Descends en étirant bien le dos.'],v:['thori']},
{id:'pullover',n:'Pull-over à la poulie',g:'dos',eq:'poulie',m:'Poulie haute avec corde ou barre',c:['Bras presque tendus, buste penché en avant.','Ramène la barre vers les cuisses en arc de cercle.','Sens l’étirement des dorsaux en haut.'],v:['tvert']},
{id:'devmil',n:'Développé militaire haltères',g:'epaules',eq:'halteres',m:'Banc à dossier droit et deux haltères',c:['Haltères à hauteur d’oreilles, paumes vers l’avant.','Pousse au-dessus de la tête sans cambrer le dos.','Redescends jusqu’aux oreilles, pas plus bas.'],v:['elev']},
{id:'elev',n:'Élévations latérales',g:'epaules',eq:'halteres',m:'Deux haltères légers, debout',c:['Monte les bras sur les côtés jusqu’à hauteur d’épaules.','Coudes légèrement fléchis, petits doigts un peu vers le haut.','Léger et contrôlé : c’est un petit muscle.'],v:['devmil','facepull']},
{id:'facepull',n:'Face pull',g:'epaules',eq:'poulie',m:'Poulie à hauteur de visage avec corde',c:['Tire la corde vers ton visage en écartant les mains.','Coudes hauts, finis comme un double biceps.','Excellent pour l’arrière d’épaule et la posture.'],v:['oiseau']},
{id:'oiseau',n:'Oiseau à la machine',g:'epaules',eq:'machine',m:'Pec fly utilisée à l’envers (reverse fly)',c:['Assis face au dossier, poitrine collée.','Ouvre les bras vers l’arrière, coudes légèrement fléchis.','Serre l’arrière des épaules en fin de mouvement.'],v:['facepull']},
{id:'squat',n:'Squat',g:'jambes',eq:'barre',m:'Rack à squat et barre olympique',c:['Barre sur les trapèzes, pieds largeur d’épaules.','Descends comme pour t’asseoir, genoux dans l’axe des pieds.','Dos droit, remonte en poussant dans les talons.'],v:['presse','fentes']},
{id:'presse',n:'Presse à cuisses',g:'jambes',eq:'machine',m:'Machine inclinée, tu pousses une plateforme',c:['Pieds au milieu de la plateforme, largeur de hanches.','Descends jusqu’à 90° aux genoux, bas du dos collé.','Ne verrouille jamais les genoux en haut.'],v:['squat']},
{id:'legcurl',n:'Leg curl',g:'jambes',eq:'machine',m:'Machine ischios, allongé ou assis',c:['Le boudin se place juste au-dessus des talons.','Ramène les talons vers les fesses.','Redescends lentement.'],v:['sdt']},
{id:'legext',n:'Leg extension',g:'jambes',eq:'machine',m:'Machine quadriceps, assis',c:['Genoux alignés avec l’axe de la machine.','Tends les jambes et contracte une seconde en haut.','Reviens sans laisser tomber la charge.'],v:['presse']},
{id:'fentes',n:'Fentes haltères',g:'jambes',eq:'halteres',m:'Deux haltères, en marchant ou sur place',c:['Grand pas en avant, genou arrière vers le sol.','Genou avant au-dessus de la cheville.','Pousse dans le talon avant pour remonter.'],v:['squat']},
{id:'sdt',n:'Soulevé de terre roumain',g:'jambes',eq:'barre',m:'Barre ou haltères, debout',c:['Genoux légèrement fléchis et fixes.','Pousse les fesses en arrière, barre qui frôle les cuisses.','Dos toujours plat, remonte en serrant les fessiers.'],v:['legcurl']},
{id:'mollets',n:'Mollets debout',g:'jambes',eq:'machine',m:'Machine à mollets ou marche avec haltère',c:['Monte sur la pointe des pieds le plus haut possible.','Tiens une seconde en haut.','Descends bas pour étirer.'],v:[]},
{id:'crunchp',n:'Crunch à la poulie',g:'abdos',eq:'poulie',m:'Poulie haute avec corde, à genoux',c:['Corde près de la tête, hanches immobiles.','Enroule le buste vers le bas en soufflant.','Ce sont les abdos qui tirent, pas les bras.'],v:['releve']},
{id:'releve',n:'Relevés de jambes',g:'abdos',eq:'corps',m:'Chaise romaine ou suspendu à la barre',c:['Dos collé au dossier, monte les genoux vers la poitrine.','Enroule le bassin en haut.','Descends lentement sans balancer.'],v:['crunchp','gainage']},
{id:'gainage',n:'Gainage',g:'abdos',eq:'corps',m:'Au sol, sur les avant-bras',c:['Corps droit des épaules aux talons.','Serre abdos et fessiers, respire normalement.','Note les secondes tenues à la place des répétitions.'],v:['releve']},
{id:'dcib',n:'Développé incliné barre',g:'pecs',eq:'barre',m:'Banc incliné à 30° et barre olympique',c:['Omoplates serrées, pieds bien ancrés au sol.','Descends la barre sur le haut des pecs, sous les clavicules.','Pousse à la verticale sans décoller les fesses du banc.'],v:['dci','dc']},
{id:'ecartes',n:'Écartés haltères',g:'pecs',eq:'halteres',m:'Banc plat et deux haltères légers',c:['Bras presque tendus, coudes légèrement fléchis et fixes.','Ouvre les bras en arc de cercle jusqu’à sentir l’étirement des pecs.','Remonte comme pour enlacer un arbre, sans cogner les haltères.'],v:['pecfly','vis']},
{id:'chestpress',n:'Développé à la machine',g:'pecs',eq:'machine',m:'Machine à développé assis (chest press)',c:['Règle le siège pour avoir les poignées à hauteur de poitrine.','Dos et tête collés au dossier, pousse sans verrouiller les coudes.','Reviens lentement, sans laisser les charges se toucher.'],v:['dc','smith']},
{id:'dipspecs',n:'Dips buste penché',g:'pecs',eq:'corps',m:'Barres parallèles',c:['Penche le buste en avant et laisse les coudes s’écarter un peu.','Descends jusqu’à sentir l’étirement des pecs, sans forcer sur les épaules.','Remonte en poussant, sans te redresser complètement.'],v:['dips','pompes']},
{id:'rowbarre',n:'Rowing barre',g:'dos',eq:'barre',m:'Barre olympique, buste penché',c:['Buste penché à 45°, dos plat, genoux légèrement fléchis.','Tire la barre vers le nombril en serrant les omoplates.','Redescends en contrôlant, sans arrondir le bas du dos.'],v:['rowing','tbar']},
{id:'sdtc',n:'Soulevé de terre',g:'dos',eq:'barre',m:'Barre olympique au sol',c:['Barre contre les tibias, dos plat, regard devant toi.','Pousse le sol avec les jambes, la barre frôle les jambes en montant.','Verrouille en haut en serrant les fessiers, sans te cambrer.'],v:['sdt','rowbarre']},
{id:'tserre',n:'Tirage vertical prise serrée',g:'dos',eq:'poulie',m:'Poulie haute assise, poignée triangle',c:['Buste légèrement en arrière, poitrine sortie.','Tire la poignée vers le haut de la poitrine, coudes le long du corps.','Remonte bras tendus pour bien étirer les dorsaux.'],v:['tvert','chinup']},
{id:'chinup',n:'Tractions en supination',g:'dos',eq:'corps',m:'Barre fixe, paumes vers toi',c:['Prise largeur d’épaules, paumes tournées vers toi.','Tire jusqu’à passer le menton au-dessus de la barre.','Descends bras tendus sans te laisser tomber.'],v:['tractions','tserre']},
{id:'tbar',n:'Rowing T-bar',g:'dos',eq:'barre',m:'Barre en T ou barre calée dans un coin',c:['Jambes fléchies, dos plat, buste penché.','Tire la charge vers le ventre, coudes près du corps.','Serre les omoplates en haut, redescends lentement.'],v:['rowbarre','thori']},
{id:'lombaires',n:'Extensions lombaires',g:'dos',eq:'corps',m:'Banc à lombaires (banc à 45°)',c:['Hanches au bord du coussin, chevilles calées.','Descends le buste dos plat, puis remonte jusqu’à l’alignement.','Ne te cambre pas en haut : arrête-toi quand le corps est droit.'],v:['sdt']},
{id:'militbarre',n:'Développé militaire barre',g:'epaules',eq:'barre',m:'Barre olympique, debout',c:['Barre sur le haut de la poitrine, mains un peu plus larges que les épaules.','Pousse au-dessus de la tête en serrant abdos et fessiers.','Rentre le menton au passage de la barre, sans cambrer le dos.'],v:['devmil','devmach']},
{id:'frontales',n:'Élévations frontales',g:'epaules',eq:'halteres',m:'Deux haltères légers, debout',c:['Monte un bras devant toi jusqu’à hauteur d’épaule.','Bras presque tendu, sans balancer le buste.','Redescends lentement et alterne.'],v:['elev']},
{id:'arnold',n:'Développé Arnold',g:'epaules',eq:'halteres',m:'Banc à dossier droit et deux haltères',c:['Départ haltères devant le visage, paumes vers toi.','Tourne les poignets en poussant, pour finir paumes vers l’avant.','Fais le chemin inverse en redescendant.'],v:['devmil']},
{id:'oiseauh',n:'Oiseau haltères',g:'epaules',eq:'halteres',m:'Deux haltères légers, assis buste penché',c:['Assis au bord du banc, buste penché sur les cuisses.','Écarte les bras sur les côtés, coudes légèrement fléchis.','Serre l’arrière des épaules en haut, sans élan.'],v:['oiseau','facepull']},
{id:'shrugs',n:'Shrugs haltères',g:'epaules',eq:'halteres',m:'Deux haltères lourds, debout',c:['Bras tendus le long du corps.','Hausse les épaules vers les oreilles, le plus haut possible.','Tiens une seconde en haut, sans rouler les épaules.'],v:[]},
{id:'devmach',n:'Développé épaules à la machine',g:'epaules',eq:'machine',m:'Machine à développé épaules, assis',c:['Règle le siège pour avoir les poignées à hauteur d’épaules.','Dos collé au dossier, pousse vers le haut sans verrouiller les coudes.','Redescends lentement jusqu’à hauteur d’oreilles.'],v:['devmil','militbarre']},
{id:'curlinc',s:'bi',n:'Curl incliné haltères',g:'bras',eq:'halteres',m:'Banc incliné à 45° et deux haltères',c:['Dos collé au banc, bras qui pendent à la verticale.','Monte les haltères sans avancer les coudes.','Redescends complètement pour étirer le biceps.'],v:['curlh','curl']},
{id:'concentration',s:'bi',n:'Curl concentré',g:'bras',eq:'halteres',m:'Un haltère, assis au bord d’un banc',c:['Coude calé contre l’intérieur de la cuisse.','Monte l’haltère vers l’épaule sans bouger le bras.','Contracte une seconde en haut, redescends lentement.'],v:['curlh','pupitre']},
{id:'curlpoulie',s:'bi',n:'Curl à la poulie',g:'bras',eq:'poulie',m:'Poulie basse avec barre droite',c:['Debout face à la poulie, coudes collés au corps.','Monte la barre vers les épaules sans reculer le buste.','La tension reste constante : contrôle aussi la descente.'],v:['curl','curlh']},
{id:'corde',s:'tri',n:'Extension triceps à la corde',g:'bras',eq:'poulie',m:'Poulie haute avec corde',c:['Coudes collés au corps, buste légèrement penché.','Pousse vers le bas en écartant la corde en fin de mouvement.','Remonte jusqu’à hauteur de poitrine sans décoller les coudes.'],v:['ext','overhead']},
{id:'dcserre',s:'tri',n:'Développé couché prise serrée',g:'bras',eq:'barre',m:'Banc plat et barre, mains largeur d’épaules',c:['Mains à largeur d’épaules, pas plus serré.','Descends la barre au bas des pecs, coudes près du corps.','Pousse en pensant à tendre les bras avec les triceps.'],v:['dips','front']},
{id:'kickback',s:'tri',n:'Kickback haltère',g:'bras',eq:'halteres',m:'Un haltère léger, buste penché',c:['Buste penché, bras collé au corps et parallèle au sol.','Tends l’avant-bras vers l’arrière sans bouger le coude.','Contracte une seconde bras tendu, reviens lentement.'],v:['ext','corde']},
{id:'hack',n:'Hack squat',g:'jambes',eq:'machine',m:'Machine hack squat, dos contre le dossier incliné',c:['Pieds largeur d’épaules au milieu de la plateforme.','Descends jusqu’à avoir les cuisses parallèles à la plateforme.','Pousse dans les talons, sans verrouiller les genoux.'],v:['presse','squat']},
{id:'frontsquat',n:'Squat avant',g:'jambes',eq:'barre',m:'Rack à squat, barre sur l’avant des épaules',c:['Barre posée sur les épaules, coudes hauts.','Descends buste bien droit, genoux dans l’axe des pieds.','Remonte en gardant les coudes levés.'],v:['squat','goblet']},
{id:'goblet',n:'Goblet squat',g:'jambes',eq:'halteres',m:'Un haltère ou une kettlebell tenu contre la poitrine',c:['Charge contre la poitrine, coudes vers le bas.','Descends entre tes jambes, dos droit.','Pousse dans les talons pour remonter.'],v:['squat','frontsquat']},
{id:'hipthrust',n:'Hip thrust',g:'jambes',eq:'barre',m:'Banc et barre posée sur les hanches',c:['Haut du dos sur le banc, barre sur le pli des hanches.','Monte le bassin jusqu’à aligner épaules, hanches et genoux.','Serre fort les fessiers en haut, menton rentré.'],v:['sdt']},
{id:'legcurla',n:'Leg curl assis',g:'jambes',eq:'machine',m:'Machine ischios assise',c:['Genoux alignés avec l’axe de la machine, cuisses bloquées.','Ramène les talons sous le siège.','Remonte lentement sans laisser tomber la charge.'],v:['legcurl','sdt']},
{id:'molleta',n:'Mollets assis',g:'jambes',eq:'machine',m:'Machine à mollets assise',c:['Boudins sur le bas des cuisses, avant des pieds sur la marche.','Monte le plus haut possible sur les pointes.','Descends bas pour étirer, sans rebondir.'],v:['mollets']},
{id:'bulgare',n:'Squat bulgare',g:'jambes',eq:'halteres',m:'Deux haltères, pied arrière sur un banc',c:['Pied arrière posé sur le banc, pied avant assez loin devant.','Descends à la verticale, genou avant dans l’axe du pied.','Pousse dans le talon avant pour remonter.'],v:['fentes','squat']},
{id:'crunch',n:'Crunch au sol',g:'abdos',eq:'corps',m:'Au sol, sur un tapis',c:['Genoux fléchis, mains aux tempes sans tirer sur la nuque.','Enroule le buste en décollant seulement les épaules.','Souffle en montant, redescends sans poser la tête.'],v:['crunchp']},
{id:'relsusp',n:'Relevés de jambes suspendu',g:'abdos',eq:'corps',m:'Suspendu à la barre fixe',c:['Suspendu bras tendus, sans balancer.','Monte les genoux ou les jambes tendues vers la poitrine.','Enroule le bassin en haut, redescends lentement.'],v:['releve']},
{id:'russian',n:'Russian twist',g:'abdos',eq:'corps',m:'Au sol, avec ou sans poids',c:['Assis, buste incliné en arrière, pieds décollés ou au sol.','Tourne les épaules d’un côté puis de l’autre.','C’est le buste qui tourne, pas seulement les bras.'],v:['crunch']},
{id:'roulette',n:'Roulette abdos',g:'abdos',eq:'corps',m:'Roue abdominale, à genoux',c:['À genoux, bras tendus sur la roulette, dos rond.','Roule vers l’avant aussi loin que tu peux sans creuser le dos.','Reviens en tirant avec les abdos, pas avec les hanches.'],v:['gainage']}
];
const EXM=Object.fromEntries(EX.map(x=>[x.id,x]));

const I={
camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
calendar:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4M12 13v4M10 15h4"/>',
home:'<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
dumbbell:'<path d="M3 10v4M6.5 7v10M17.5 7v10M21 10v4M6.5 12h11"/>',
chart:'<path d="M4 19h16M5 15l4-5 4 3 6-7"/>',
moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
check:'<path d="M5 12l5 5 9-10"/>',
up:'<path d="M4 17l6-6 4 4 6-7M15 8h5v5"/>',
chev:'<path d="M9 6l6 6-6 6"/>',
chevl:'<path d="M15 6l-6 6 6 6"/>',
barcode:'<path d="M4 6v12M7.5 6v12M11 6v8M14 6v12M17 6v8M20 6v12"/>',
dots:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
week:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2"/>',
star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>'
};
function ic(n,s=20){return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`}
const EQ={
barre:'<path d="M6 32h52M10 22v20M16 18v28M48 18v28M54 22v20"/>',
halteres:'<path d="M12 22h16M12 18v8M16 16v12M24 16v12M28 18v8M36 42h16M36 38v8M40 36v12M48 36v12M52 38v8"/>',
machine:'<rect x="14" y="8" width="36" height="48" rx="3"/><path d="M22 20h20M32 20v22M24 44h16"/>',
poulie:'<path d="M10 56V8h44v48"/><circle cx="32" cy="14" r="4"/><path d="M32 18v24M24 42h16"/>',
corps:'<circle cx="32" cy="12" r="5"/><path d="M32 17v20M20 26h24M32 37l-8 17M32 37l8 17"/>'
};
function pict(eq,s=30){return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EQ[eq]||EQ.machine}</svg>`}

// Photos des exercices (img/ex) : vignette t_<id>.jpg, position de départ <id>_0.jpg et d'arrivée <id>_1.jpg.
// Si la photo ne charge pas (hors ligne), le pictogramme en dessous reste visible. Les exercices créés par l'utilisateur gardent le pictogramme.
function exPic(x,s=30){return pict(x.eq,s)+(x.u?'':`<img src="img/ex/t_${x.id}.jpg" alt="" loading="lazy" onerror="this.remove()">`)}
function exPhoto(x){const p=`<div class="pict lg">${pict(x.eq,64)}</div>`;return x.u?p:`<div class="exph">${p}<img src="img/ex/${x.id}_0.jpg" alt="Position de départ" onerror="this.parentNode.classList.add('ko')"><img class="b" src="img/ex/${x.id}_1.jpg" alt="Position d’arrivée" onerror="this.parentNode.classList.add('ko')"></div>`}

// Ajouts rapides : g = portion proposée en grammes, p = valeurs pour 100 g
const QUICK=[
{id:'banane',n:'Banane',name:'Banane',g:120,p:{kcal:89,proteines:1.1,glucides:22.8,lipides:.3},note:'Une banane moyenne pèse environ 120 g sans la peau.'},
{id:'fbavoine',n:'Fromage blanc + avoine',name:'Fromage blanc + flocons d’avoine',g:250,p:{kcal:134,proteines:8.6,glucides:15.2,lipides:3.8},note:'Base : 200 g de fromage blanc à 3 % et 50 g de flocons d’avoine.'},
{id:'oeufs',n:'3 œufs',name:'Œufs',g:165,p:{kcal:145,proteines:12.5,glucides:.7,lipides:10},note:'Un œuf pèse environ 55 g : 165 g pour 3 œufs.'},
{id:'thon',n:'Thon',name:'Thon au naturel',g:112,p:{kcal:116,proteines:26,glucides:0,lipides:1},note:'Une boîte de 160 g donne environ 112 g de thon égoutté.'},
{id:'rizpoulet',n:'Riz + poulet',name:'Riz + poulet',g:350,p:{kcal:145,proteines:14.8,glucides:16,lipides:1.7},note:'Base : 200 g de riz cuit et 150 g de blanc de poulet.'}
];

// Utilitaires
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
function dk(d=new Date()){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseDk(s){const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseDk(s);d.setDate(d.getDate()+n);return dk(d)}
function diffDays(a,b){return Math.round((parseDk(b)-parseDk(a))/864e5)}
const JOURS=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
const JOURSL=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const MOISL=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function fmtDay(s){const d=parseDk(s);return JOURS[d.getDay()]+' '+d.getDate()+' '+MOIS[d.getMonth()]}
function fmtDayLong(s){const d=parseDk(s);return JOURSL[d.getDay()]+' '+d.getDate()+' '+MOIS[d.getMonth()]}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r0=n=>Math.round(Number(n)||0);
const num=v=>{const n=parseFloat(String(v??'').replace(',','.'));return isFinite(n)?n:0};
const fmtKg=v=>String(Math.round(v*10)/10).replace('.',',');
const fmtN=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function fmtH(h){const H=Math.floor(h),M=Math.round((h-H)*60);return H+'h'+(M?pad(M):'')}
const groupsLabel=gs=>(gs||[]).map(g=>GN[g]).filter(Boolean).join(' + ');
const avgA=a=>a.reduce((t,x)=>t+x,0)/a.length;

// Données
function def(){return{v:1,profile:{kg:70,cm:182,age:21,kcal:3000,prot:150,carb:420,fat:80,wake:'07:00',weekGoal:4,rest:90,restHeavy:150,wkcal:120,wprot:24,wcarb:2,wfat:1.5},meals:[],sessions:[],plans:[],weights:[],sleep:[],custom:{},myEx:[],favs:[],lastExport:0,snoozeExport:0}}
function hydrate(d){const b=def();return Object.assign(b,d,{profile:Object.assign(b.profile,(d&&d.profile)||{})})}
function load(){try{const r=localStorage.getItem(K);if(r)return hydrate(JSON.parse(r))}catch(e){}return def()}
let S=load();
// Exercices créés par l'utilisateur (S.myEx) : ajoutés à la bibliothèque. Un exercice supprimé (off) garde son nom dans l'historique mais n'est plus proposé.
const EQN={barre:'Barre',halteres:'Haltères',machine:'Machine',poulie:'Poulie',corps:'Poids du corps'};
const cleanTx=s=>String(s??'').replace(/'/g,'’').replace(/[<>&"`]/g,'').trim();
let UEX=[];
function syncEx(){for(const id of UEX){delete EXM[id];const i=EX.findIndex(x=>x.id===id);if(i>=0)EX.splice(i,1)}UEX=[];
for(const x of Array.isArray(S.myEx)?S.myEx:[]){if(!x||!/^[\w-]+$/.test(x.id||'')||EXM[x.id])continue;const eq=EQ[x.eq]?x.eq:'machine';const e={id:x.id,n:cleanTx(x.n)||'Exercice',g:GN[x.g]?x.g:'pecs',eq,m:cleanTx(x.m)||EQN[eq],c:(Array.isArray(x.c)?x.c:[]).map(cleanTx).filter(Boolean),v:[],u:1,off:!!x.off};EXM[e.id]=e;UEX.push(e.id);if(!e.off)EX.push(e)}}
syncEx();
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast("Impossible d'enregistrer sur cet appareil")}}
// Une séance prévue mais pas faite reste 7 jours, le temps de la reporter
S.plans=S.plans.filter(p=>p.date>=addDays(dk(),-7));
function missedPlans(){const lim=addDays(dk(),-7);return S.plans.filter(p=>p.date<dk()&&p.date>=lim&&!S.sessions.some(s=>s.done&&s.date===p.date)).sort((a,b)=>a.date<b.date?-1:1)}
// Migration v1 -> v2 : nouveaux objectifs prise de masse
if((S.v||1)<2){const P=S.profile;if(P.kcal===2800&&P.prot===140){P.kcal=3000;P.prot=150;P.carb=420;P.fat=80}if(P.cm===183)P.cm=182;S.v=2;try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function weekStart(d=dk()){const x=parseDk(d);const wd=(x.getDay()+6)%7;x.setDate(x.getDate()-wd);return dk(x)}
function weightAdvice(){const W=S.weights.slice().sort((a,b)=>a.date<b.date?-1:1).filter(w=>diffDays(w.date,dk())<=35);if(W.length<3)return null;const span=diffDays(W[0].date,W[W.length-1].date);if(span<14)return null;
// pente par moindres carrés (kg/semaine)
const xs=W.map(w=>diffDays(W[0].date,w.date)),ys=W.map(w=>w.kg),mx=avgA(xs),my=avgA(ys);let nu=0,de=0;xs.forEach((x,i)=>{nu+=(x-mx)*(ys[i]-my);de+=(x-mx)**2});const rate=de?nu/de*7:0;
if(rate<0.15)return{rate,msg:`Tu prends ${fmtKg(rate)} kg par semaine : trop lent pour ta prise de masse. Monte de 150 kcal.`,delta:150};
if(rate>0.5)return{rate,msg:`Tu prends ${fmtKg(rate)} kg par semaine : un peu trop vite, risque de gras. Baisse de 150 kcal.`,delta:-150};
return{rate,msg:`Tu prends ${fmtKg(rate)} kg par semaine : rythme idéal, garde le cap.`,delta:0}}

function dayTotals(day=dk()){return S.meals.filter(m=>m.date===day).reduce((t,m)=>({kcal:t.kcal+(+m.kcal||0),prot:t.prot+(+m.prot||0),carb:t.carb+(+m.carb||0),fat:t.fat+(+m.fat||0)}),{kcal:0,prot:0,carb:0,fat:0})}
const exG=id=>(EXM[id]||{}).g;
const activeSession=()=>S.sessions.find(s=>!s.done);
function lastTrained(g,asOf=dk()){let best=null;for(const s of S.sessions){if(s.date>asOf)continue;if(s.exercises.some(e=>exG(e.exId)===g&&e.sets.length)){if(!best||s.date>best)best=s.date}}return best}
function daysSince(g,asOf=dk()){const l=lastTrained(g,asOf);return l==null?null:diffDays(l,asOf)}
function suggestGroups(asOf=dk()){let pick='pecs',pv=-1;for(const[g]of GROUPS){if(g==='abdos'||g==='bras')continue;const d=daysSince(g,asOf);const v=d==null?999:d;if(v>pv){pv=v;pick=g}}return PAIR[pick].slice()}
function exHistory(id){return S.sessions.filter(s=>s.done).map(s=>{const e=s.exercises.find(x=>x.exId===id);if(!e||!e.sets.length)return null;const max=Math.max(...e.sets.map(x=>+x.kg||0));return{date:s.date,max,best:Math.max(...e.sets.filter(x=>(+x.kg||0)>=max).map(x=>+x.reps||0)),sets:e.sets}}).filter(Boolean).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0)}
function lastPerf(id){const h=exHistory(id);return h.length?h[h.length-1]:null}
// Sans charge (tractions, pompes, gainage…) la progression se lit en répétitions ou en secondes, pas en kg
const exUnit=id=>id==='gainage'?'s':'reps';
const allBW=h=>h.length>0&&h.every(x=>x.max===0);
const fmtPerf=(id,h,rp=h.max===0)=>rp?h.best+' '+exUnit(id):fmtKg(h.max)+' kg';
function exRecord(id){const h=exHistory(id);if(!h.length)return null;const rp=allBW(h);return{rp,best:Math.max(...h.map(x=>rp?x.best:x.max))}}
const fmtRecord=(id,r)=>r.rp?r.best+' '+exUnit(id):fmtKg(r.best)+' kg';
function stagnating(id){const h=exHistory(id).slice(-3);if(h.length<3)return false;const rp=allBW(h),v=h.map(x=>rp?x.best:x.max);return v[0]>0&&v[0]===v[1]&&v[1]===v[2]}
const vol=s=>s.exercises.reduce((t,e)=>t+e.sets.reduce((u,x)=>u+(+x.reps||0)*(+x.kg||0),0),0);
function nextPlan(){return S.plans.filter(p=>p.date>=dk()).sort((a,b)=>(a.date+a.time)<(b.date+b.time)?-1:1)[0]}
function bedtimes(wake=S.profile.wake){const[w,m]=String(wake||'07:00').split(':').map(Number);const wm=w*60+m;return[5,6].map(c=>{let x=wm-c*90-15;x=((x%1440)+1440)%1440;return pad(Math.floor(x/60))+':'+pad(x%60)})}

// Séances toutes prêtes : 3 styles, mêmes muscles, exercices différents
const STYLES={A:{n:'Séance A',d:'Barres et charges lourdes, pour la force.'},B:{n:'Séance B',d:'Haltères, plus d’amplitude et de contrôle.'},C:{n:'Séance C',d:'Machines et poulies, pour bien isoler le muscle.'}};
const PROG={pecs:{A:['dc','dci','pecfly'],B:['dch','dci','vis'],C:['smith','pecfly','pompes']},dos:{A:['tractions','rowing','thori'],B:['tvert','rowing','pullover'],C:['tvert','thori','pullover']},epaules:{A:['devmil','elev','facepull'],B:['devmil','elev','oiseau'],C:['elev','facepull','oiseau']},jambes:{A:['squat','sdt','legext','mollets'],B:['presse','fentes','legcurl','mollets'],C:['presse','legext','legcurl','mollets']},tri:{A:['dips','front'],B:['ext','overhead'],C:['ext','dips']},bi:{A:['curl','marteau'],B:['curlh','marteau'],C:['pupitre','curlh']},abdos:{A:['releve','gainage'],B:['crunchp','gainage'],C:['crunchp','releve']}};
function rxFor(id,first){const x=EXM[id];if(id==='gainage')return '3 × 40 s';if(x.g==='abdos')return '3 × 12-15';if(first)return '4 × 6-8';if(x.eq==='poulie'||(x.eq==='machine'&&id!=='presse'&&id!=='smith'))return '3 × 10-12';return '3 × 8-10'}
function buildProgram(groups,style){const ids=[];groups.forEach((g,gi)=>{const keys=g==='bras'?(groups.includes('pecs')&&!groups.includes('dos')?['tri']:groups.includes('dos')&&!groups.includes('pecs')?['bi']:['tri','bi']):[g];keys.forEach(k=>{let l=PROG[k][style];if(gi>0)l=l.slice(0,keys.length>1?1:2);l.forEach(id=>{if(!ids.includes(id))ids.push(id)})})});return ids.map((id,i)=>({exId:id,rx:rxFor(id,i===0&&EXM[id].g!=='abdos'),sets:[]}))}
function lastStyleDate(groups,style){let d=null;for(const s of S.sessions)if(s.done&&s.style===style&&s.groups[0]===groups[0]&&(!d||s.date>d))d=s.date;return d}
function recommendedStyle(groups){let best='A',bd='9999';for(const st of['A','B','C']){const v=lastStyleDate(groups,st)||'0000';if(v<bd){bd=v;best=st}}return best}

const progKey=(groups,style)=>groups.join('+')+':'+style;
function getProgram(groups,style){const c=(S.custom||{})[progKey(groups,style)];if(c&&c.length)return c.filter(e=>EXM[e.exId]).map(e=>({exId:e.exId,rx:e.rx,sets:[]}));return buildProgram(groups,style)}
function saveCustom(act){if(!act||!act.style)return;S.custom=S.custom||{};S.custom[progKey(act.groups,act.style)]=act.exercises.map(e=>({exId:e.exId,rx:e.rx||rxFor(e.exId,false)}))}
