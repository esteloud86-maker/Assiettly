# Photos de la démo de scan (landing)

Dépose ici les vraies photos de plats utilisées par la démo interactive du
hero (`src/components/landing/DemoScan.tsx`, données dans
`src/data/demoScanPlats.ts`). Photos maison, dans l'esprit de ce qu'un
utilisateur prendrait réellement avec son téléphone — pas de banque d'images,
pas de visuels d'une autre app.

Noms de fichiers attendus (un par plat, format jpg/png/webp) :

- `quiche-lorraine.jpg`
- `boeuf-bourguignon.jpg`
- `croissant.jpg`
- `croque-monsieur.jpg`
- `poulet-riz.jpg`
- `ratatouille.jpg`

Une fois une photo déposée, fais tourner un vrai scan dessus (écran
`/scanner` de l'app) et recopie le résultat obtenu dans le champ `resultat`
de l'entrée correspondante dans `src/data/demoScanPlats.ts`. Tant que
`resultat` reste à `null`, la démo affiche un état "résultat à venir" au lieu
d'inventer un chiffre.
