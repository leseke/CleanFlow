# CleanFlow — DEMO-001

> Démonstration commerciale : transformer un export CSV imparfait en données propres, exploitables et documentées.

## Pourquoi ce projet existe

CleanFlow n'est pas une « todo list » de portfolio. Il démontre une compétence vendable aux TPE/PME : **automatiser un nettoyage de données répétitif**.

Cas typiques : export CRM, fichier clients, préparation avant migration, reporting, facturation ou synchronisation entre outils.

## Démo

```bash
npm run serve
# puis http://localhost:8080
```

Ou ouvrir le projet via un serveur statique / GitHub Pages. Le traitement est 100% côté navigateur : aucun fichier n'est envoyé à un serveur.

## Fonctionnalités

- import CSV ;
- détection automatique `,`, `;` ou tabulation ;
- parsing des champs entre guillemets ;
- nettoyage des espaces ;
- normalisation emails ;
- normalisation des téléphones français ;
- normalisation des dates vers `YYYY-MM-DD` ;
- détection des formats invalides ;
- dédoublonnage prioritairement par email/téléphone ;
- aperçu avant/après ;
- rapport de qualité ;
- export CSV nettoyé ;
- export JSON du rapport ;
- aucune dépendance externe.

## Tests

```bash
npm test
```

Les tests couvrent le parsing CSV, les guillemets, dates, téléphones, dédoublonnage et export.

## Positionnement commercial

> « Vous nettoyez encore manuellement un fichier Excel/CSV chaque semaine ? Je peux transformer ce processus en un outil qui le fait en quelques secondes. »

Le projet peut servir de base à une prestation sur mesure : règles métier spécifiques, Excel XLSX, base de données, API, génération de rapport, validation humaine ou intégration à un workflow existant.

## Ce que le projet démontre

- compréhension d'un problème métier ;
- conception d'une UX simple ;
- traitement de données ;
- robustesse du parsing ;
- règles de normalisation explicites ;
- refus d'inventer une donnée invalide ;
- tests automatisés ;
- livraison sans dépendances ni infrastructure.

## Stack

JavaScript ES modules, HTML, CSS, Node.js uniquement pour les tests et le serveur local.

## Portfolio

Ce projet complète **Chroniques**, qui sert de preuve de profondeur technique C#/.NET. CleanFlow sert de preuve de **capacité à transformer un besoin d'entreprise en solution immédiatement compréhensible**.