# Coach Salle

Mon app perso de coaching : nutrition, planification, séances et progrès.
Web app pour iPhone, données stockées uniquement sur le téléphone.

## Structure du projet

```
coach-salle/
├── index.html             Page unique de l'app
├── css/style.css          Tout le style (thème sombre)
├── js/data.js             Données, exercices, séances A/B/C, calculs
├── js/ai.js               Accès à Claude (compte claude.ai ou clé API)
├── js/today.js            Onglet Aujourd'hui, scan photo, historique des repas, sommeil, planification
├── js/barcode.js          Scan par code-barres (Open Food Facts)
├── js/vendor/             Bibliothèque de lecture de code-barres (Quagga), chargée au premier scan
├── js/gym.js              Onglets Planifier, Salle, Progrès, réglages, navigation
├── manifest.webmanifest   Installation sur l'écran d'accueil
├── sw.js                  Mode hors ligne et mise à jour automatique
├── icons/                 Icônes de l'app
└── img/ex/                Photos des exercices (free-exercise-db, domaine public)
```

Les fichiers JS sont chargés dans cet ordre et partagent leurs variables :
`data.js` → `ai.js` → `today.js` → `barcode.js` → `gym.js`.

---

## 1. Tester sur ton ordinateur

1. Dans VS Code : **Fichier > Ouvrir le dossier…** et choisis `coach-salle`.
2. Installe l'extension **Live Server** (onglet Extensions, cherche « Live Server » de Ritwick Dey).
3. Clic droit sur `index.html` > **Open with Live Server**.
   L'app s'ouvre dans ton navigateur. Chaque fois que tu enregistres un fichier, la page se recharge.

Astuce : dans Chrome, fais F12, puis l'icône téléphone, pour voir l'app au format iPhone.

---

## 2. Mettre l'app en ligne avec GitHub Pages (gratuit)

1. Crée un compte sur **github.com** si tu n'en as pas.
2. Clique sur **New repository** :
   - Nom : `coach-salle`
   - Visibilité : **Public** (obligatoire pour GitHub Pages gratuit).
     Seul le code est visible. Tes données et ta clé API restent sur ton téléphone.
   - Clique sur **Create repository**.
3. Envoie les fichiers, au choix :
   - **Le plus simple** : sur la page du dépôt, clique sur **uploading an existing file**, glisse tout le contenu du dossier `coach-salle`, puis clique sur **Commit changes**.
   - **Depuis VS Code** : onglet **Source Control** (icône de branches) > **Publish to GitHub**. Il faut que Git soit installé.
4. Dans le dépôt : **Settings > Pages**.
   - Source : **Deploy from a branch**
   - Branch : **main**, dossier **/ (root)**, puis **Save**.
5. Attends 1 à 2 minutes. Ton app est en ligne à l'adresse :
   `https://cesarbellonnet.github.io/coach-salle/`

---

## 3. Installer l'app sur l'iPhone

1. Ouvre l'adresse dans **Safari**.
2. Touche **Partager** > **Sur l'écran d'accueil** > **Ajouter**.
3. Ouvre toujours l'app depuis cette icône. Elle s'affiche en plein écran et marche même sans réseau.

---

## 4. Activer la lecture des photos (clé API Anthropic)

1. Va sur **console.anthropic.com** et crée un compte.
2. **Billing** : ajoute du crédit. Le minimum suffit pour des centaines de scans,
   car le modèle utilisé (Claude Haiku 4.5) coûte moins d'un centime par photo.
3. **Limits** : fixe une limite de dépense mensuelle basse, par exemple 5 $.
   Si ta clé fuit un jour, la casse est limitée.
4. **API Keys > Create Key** : copie la clé (elle commence par `sk-ant-`).
5. Dans l'app : roue des réglages > **Lecture des étiquettes** > colle la clé > **Enregistrer et tester**.

Sécurité :
- Ne mets **jamais** ta clé dans le code ni sur GitHub.
- Elle est stockée uniquement sur ton téléphone, et n'est pas incluse dans les sauvegardes.
- Pour la changer : **Supprimer**, puis colle la nouvelle.

---

## 5. Récupérer tes données de la version claude.ai

1. Dans l'ancienne version (lien claude.ai) : réglages > **Exporter une sauvegarde**.
   Le fichier arrive dans l'app **Fichiers** de l'iPhone.
2. Dans la nouvelle version : réglages > **Restaurer une sauvegarde** > choisis le fichier.

Les sauvegardes faites avec cette version contiennent aussi les photos du mois.
Celles de l'ancienne version claude.ai ne les contiennent pas : reprends-les dans la nouvelle version.

---

## 6. Mettre à jour l'app

1. Modifie le code dans VS Code et teste avec Live Server.
2. Onglet **Source Control** : écris un message, **Commit**, puis **Sync Changes**.
3. Attends 1 à 2 minutes que GitHub publie.
4. Ouvre l'app sur l'iPhone : elle télécharge la nouvelle version en arrière-plan, se recharge toute seule
   et affiche « App mise à jour ». Si elle était restée ouverte, elle vérifie quand tu y reviens.

Plus besoin de changer la version dans `sw.js` : le service worker compare les fichiers lui-même.
---

## Ce que fait l'app

- **Repas** : photo d'une étiquette ou d'un plat (clé API), **scan du code-barres** (gratuit, sans clé),
  saisie à la main, favoris. Historique : flèches ou bande des 7 derniers jours pour voir un jour passé,
  y ajouter un oubli, ou toucher un repas pour le modifier.
- **Séances** : planification, séances A/B/C, **minuteur de repos** après chaque série validée,
  **exercices personnalisés** (Réglages > Mes exercices). Une séance prévue mais ratée peut être reportée,
  et une séance laissée ouverte se termine à ta dernière série.
- **Progrès** : poids, charges, records, et **bilan nutrition de la semaine** (moyenne de calories et de protéines
  sur 7 jours, comparée à la semaine d'avant). Les exercices au poids du corps sont suivis en répétitions.
- **Muscles** : pecs, dos, épaules, biceps, triceps, jambes, abdos.
- **Agenda iPhone** : le bouton « Ajouter à l'agenda de l'iPhone » ouvre la séance dans Calendrier, avec un rappel 30 minutes avant.
- **Sauvegarde** : un fichier qui contient tout, photos comprises. Sur iPhone, choisis « Enregistrer dans Fichiers ».
- **Mode hors ligne**, **icône sur l'écran d'accueil**, **mise à jour automatique**.
Limite qui reste : c'est une web app. Pas d'accès à l'app Santé (pas, fréquence cardiaque, sommeil).
