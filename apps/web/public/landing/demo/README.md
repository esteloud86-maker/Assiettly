# Photos de la démo de scan (landing)

Photos de la démo interactive du hero (`src/components/landing/DemoScan.tsx`,
données dans `src/data/demoScanPlats.ts`). Photos maison, dans l'esprit de ce
qu'un utilisateur prendrait réellement avec son téléphone — pas de banque
d'images, pas de visuels d'une autre app.

Format attendu : **WebP, ≤800px de large, ≤150 Ko, sans métadonnées EXIF**
(`convert source.jpg -resize '800x800>' -strip -quality 82 nom.webp`).

Noms de fichiers attendus (un par plat) :

- `quiche-lorraine.webp` ✅
- `boeuf-bourguignon.webp` ✅
- `croissant.webp` ✅
- `croque-monsieur.webp` ✅
- `poulet-riz.webp` ✅
- `ratatouille.webp` — **manquante**, à fournir

Une fois une photo déposée (ou remplacée), lance
`npx tsx scripts/generer-demo-scan.ts` (depuis `apps/web`, avec un vrai
`ANTHROPIC_API_KEY` dans `.env`) : il envoie chaque photo présente au module
d'analyse réel et imprime un tableau des résultats exacts. Recopie-les dans
le champ `resultat` de l'entrée correspondante dans
`src/data/demoScanPlats.ts`. Tant que `resultat` reste à `null`, la démo
affiche "Résultat à venir" au lieu d'inventer un chiffre.
