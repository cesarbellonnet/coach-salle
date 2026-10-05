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
├── js/today.js            Onglet Aujourd'hui, scan, sommeil, planification
├── js/gym.js              Onglets Planifier, Salle, Progrès, réglages, navigation
├── manifest.webmanifest   Installation sur l'écran d'accueil
├── sw.js                  Mode hors ligne
└── icons/                 Icônes de l'app
```

Les fichiers JS sont chargés dans cet ordre et partagent leurs variables :
`data.js` → `ai.js` → `today.js` → `gym.js`.

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
   `https://TON-PSEUDO.github.io/coach-salle/`

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

Les photos du mois ne sont pas incluses dans la sauvegarde. Reprends-les dans la nouvelle version.

---

## 6. Mettre à jour l'app

1. Modifie le code dans VS Code et teste avec Live Server.
2. Dans `sw.js`, change la version, par exemple `coach-salle-v1` → `coach-salle-v2`.
   Sans ça, l'iPhone garde l'ancienne version en cache.
3. Renvoie les fichiers modifiés sur GitHub.
4. Sur l'iPhone : ferme complètement l'app puis rouvre-la, deux fois si besoin.

---

## Ce qui marche maintenant (et pas sur claude.ai)

- **Lecture des photos** d'étiquettes et de plats, avec ta clé API.
- **Agenda iPhone** : le bouton « Ajouter à l'agenda de l'iPhone » ouvre un fichier .ics, que l'iPhone ajoute à Calendrier.
- **Mode hors ligne** et **icône sur l'écran d'accueil**.

Limite qui reste : c'est une web app. Pas d'accès à l'app Santé (pas, fréquence cardiaque, sommeil).
