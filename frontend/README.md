# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
CONTENU POUR LE DOCUMENT TPE

Gestion de l'Administration et des Droits d'Accès
1. Principe général — Hiérarchie des rôles
Le système applique un contrôle d'accès basé sur les rôles (RBAC — Role-Based Access Control). Six rôles distincts sont définis, organisés selon une hiérarchie stricte de niveaux de privilèges :
NiveauRôleDescription6AdministrateurAccès total au système5Directeur GénéralConsultation et rapports4Responsable TechniqueGestion des interventions3Responsable StocksGestion du stock et des commandes2CommercialClients, devis, facturation1TechnicienSes propres interventions uniquement
Règle fondamentale : Un utilisateur ne peut gérer (créer, modifier, désactiver) que des comptes dont le niveau hiérarchique est strictement inférieur au sien. Un administrateur ne peut être modifié que par un autre administrateur.

2. Matrice des droits d'accès par module
ModuleAdminDirecteurResp. TechniqueCommercialResp. StocksTechnicienTableau de bord✅ Complet✅ Lecture✅ Partiel✅ Partiel✅ Partiel✅ PartielClients✅ CRUD✅ Lecture✅ Lecture✅ CRUD❌❌Équipements✅ CRUD✅ Lecture✅ CRUD✅ Lecture❌✅ LectureInterventions✅ CRUD✅ Lecture✅ CRUD❌❌✅ Les siennesStock & Pièces✅ CRUD✅ Lecture✅ Lecture❌✅ CRUD❌Commandes✅ CRUD✅ Lecture❌❌✅ CRUD❌Devis✅ CRUD✅ Lecture❌✅ CRUD❌❌Factures✅ CRUD✅ Lecture❌✅ CRUD❌❌Administration✅ Complet❌❌❌❌❌
(CRUD = Créer, Lire, Modifier, Supprimer)

3. Règles de sécurité appliquées
Les règles suivantes sont imposées aussi bien au niveau du backend (Django) que du frontend (React) :
Règle 1 — Hiérarchie stricte : Un utilisateur ne peut créer ou modifier un compte que si le rôle cible est d'un niveau strictement inférieur au sien. Exemple : un Responsable Technique (niveau 4) peut créer un compte Technicien (niveau 1) mais pas un compte Directeur (niveau 5).
Règle 2 — Autodésactivation interdite : Aucun utilisateur ne peut désactiver son propre compte, afin d'éviter de se retrouver bloqué hors du système.
Règle 3 — Filtrage des données par rôle : Un technicien ne voit dans l'interface que les interventions qui lui sont personnellement affectées. Il n'a pas accès aux interventions des autres techniciens.
Règle 4 — Protection des routes : Chaque page de l'application React est protégée par une vérification du rôle de l'utilisateur connecté. Toute tentative d'accès à une page non autorisée redirige vers une page d'erreur 403 (Accès refusé).
Règle 5 — Tokens JWT sécurisés : L'authentification utilise des tokens JWT (JSON Web Token) avec une durée de validité de 8 heures. Un token de rafraîchissement valide 7 jours permet de renouveler automatiquement la session sans demander à l'utilisateur de se reconnecter.
Règle 6 — Mots de passe hachés : Les mots de passe ne sont jamais stockés en clair. Django utilise l'algorithme PBKDF2 avec SHA-256 pour le hachage. Le hash n'est jamais exposé dans les réponses de l'API.

4. Implémentation technique
Côté Backend (Django REST Framework) :
Les permissions sont définies dans une classe PeutGererUtilisateur qui hérite de BasePermission. Chaque ViewSet applique des permissions différentes selon l'action demandée (liste, création, modification, suppression). La hiérarchie est encodée dans une liste ordonnée de rôles permettant une comparaison de niveaux.
Côté Frontend (React + TypeScript) :
Un hook usePermissions expose des helpers booléens (estAdmin, estCommercial, etc.) et une fonction peutGererUtilisateur(role) qui compare le niveau du rôle courant à celui de la cible. Le composant PrivateRoute accepte une prop rolesPermis qui liste les rôles autorisés à accéder à chaque route. Si le rôle de l'utilisateur connecté n'est pas dans la liste, il est redirigé automatiquement vers la page "Accès refusé".