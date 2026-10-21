/**
 * Génère la carte de partage "Mon assiette" — image 9:16 (format story)
 * entièrement côté client via Canvas, rien n'est envoyé ni stocké sur un
 * serveur, pas de page publique à créer. Partagée ensuite via la Web Share
 * API (menu de partage natif du téléphone).
 *
 * Honnêteté non négociable (cf. brief viralité) : seules des valeurs
 * réellement mesurées sur CE repas (celles affichées à l'utilisateur sur
 * l'écran de résultat du scan) apparaissent sur la carte — jamais de
 * moyenne ni de chiffre arrondi "pour faire joli".
 */
export interface DonneesCarteAssiette {
  photoUrl: string;
  nomPlat: string;
  caloriesKcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  streakJours: number;
  /** Premium retire le filigrane "assiettly.fr" en bas de carte. */
  premium: boolean;
}

const LARGEUR = 1080;
const HAUTEUR = 1920;

// Palette de marque (cf. tailwind.config.ts) — dupliquée ici car Canvas ne
// lit pas les classes Tailwind, seulement des couleurs CSS littérales.
const CHARBON_800 = "#2B2320";
const CREME_50 = "#FEFCFA";
const CREME_100_60 = "rgba(251, 244, 236, 0.6)";
const CORAIL_500 = "#F2603C";
const AMBRE_500 = "#F2953C";

function chargerImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de charger la photo du repas."));
    img.src = src;
  });
}

function dessinerRectArrondi(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function genererCarteAssiette(data: DonneesCarteAssiette): Promise<Blob> {
  // Attend que les polices de marque soient prêtes — sans ça, sur un
  // premier partage juste après le chargement de la page, Canvas dessine
  // avec la police de secours système avant que Fredoka n'ait fini de
  // charger.
  if (typeof document !== "undefined" && "fonts" in document) {
    await Promise.all([
      document.fonts.load("700 48px Fredoka"),
      document.fonts.load("600 36px Fredoka"),
      document.fonts.load("400 32px Inter"),
    ]).catch(() => {});
  }

  const canvas = document.createElement("canvas");
  canvas.width = LARGEUR;
  canvas.height = HAUTEUR;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supporté sur cet appareil.");

  // Fond ivoire chaud (identité de marque, cf. brief design "la carte").
  ctx.fillStyle = CREME_50;
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);

  // Photo du plat en haut, cadrée en carré, coins arrondis.
  const photo = await chargerImage(data.photoUrl);
  const tailleCote = LARGEUR - 96;
  const photoX = 48;
  const photoY = 140;
  dessinerRectArrondi(ctx, photoX, photoY, tailleCote, tailleCote, 48);
  ctx.save();
  ctx.clip();
  const ratioPhoto = Math.max(tailleCote / photo.width, tailleCote / photo.height);
  const photoLargeur = photo.width * ratioPhoto;
  const photoHauteur = photo.height * ratioPhoto;
  ctx.drawImage(
    photo,
    photoX - (photoLargeur - tailleCote) / 2,
    photoY - (photoHauteur - tailleCote) / 2,
    photoLargeur,
    photoHauteur,
  );
  ctx.restore();

  // Eyebrow "Assiettly" au-dessus de la photo.
  ctx.fillStyle = CORAIL_500;
  ctx.font = "700 34px Fredoka, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Assiettly", 48, 96);

  // Nom du plat.
  ctx.fillStyle = CHARBON_800;
  ctx.font = "700 64px Fredoka, sans-serif";
  const nomY = photoY + tailleCote + 100;
  ctx.fillText(tronquer(ctx, data.nomPlat, LARGEUR - 96), 48, nomY);

  // Calories — gros chiffre.
  const texteKcal = `${Math.round(data.caloriesKcal)}`;
  ctx.font = "700 140px Fredoka, sans-serif";
  ctx.fillText(texteKcal, 48, nomY + 170);
  const largeurGrosChiffre = ctx.measureText(texteKcal).width;
  ctx.font = "600 40px Inter, sans-serif";
  ctx.fillText("kcal", 48 + largeurGrosChiffre + 20, nomY + 170);

  // Macros P / G / L.
  const macroY = nomY + 250;
  const macros: [string, number, string][] = [
    ["Protéines", data.proteinesG, CORAIL_500],
    ["Glucides", data.glucidesG, "#166057"],
    ["Lipides", data.lipidesG, AMBRE_500],
  ];
  const largeurBloc = (LARGEUR - 96) / 3;
  macros.forEach(([label, valeur, couleur], i) => {
    const x = 48 + i * largeurBloc;
    ctx.fillStyle = CHARBON_800;
    ctx.font = "700 52px Fredoka, sans-serif";
    ctx.fillText(`${Math.round(valeur)}g`, x, macroY);
    ctx.fillStyle = couleur;
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText(label, x, macroY + 44);
  });

  // Flamme / streak.
  if (data.streakJours > 0) {
    const flammeY = macroY + 140;
    ctx.fillStyle = CHARBON_800;
    ctx.font = "600 44px Inter, sans-serif";
    ctx.fillText(`🔥 ${data.streakJours} jour${data.streakJours > 1 ? "s" : ""} de flamme`, 48, flammeY);
  }

  // Pied de carte : filigrane gratuit uniquement (retiré en Premium).
  if (!data.premium) {
    ctx.fillStyle = CREME_100_60;
    ctx.fillRect(0, HAUTEUR - 110, LARGEUR, 110);
    ctx.fillStyle = CHARBON_800;
    ctx.font = "600 32px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Suis tes macros avec Assiettly · assiettly.fr", LARGEUR / 2, HAUTEUR - 50);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Échec de la génération de l'image."))), "image/png", 0.95);
  });
}

function tronquer(ctx: CanvasRenderingContext2D, texte: string, largeurMax: number): string {
  if (ctx.measureText(texte).width <= largeurMax) return texte;
  let tronque = texte;
  while (tronque.length > 1 && ctx.measureText(`${tronque}…`).width > largeurMax) {
    tronque = tronque.slice(0, -1);
  }
  return `${tronque}…`;
}

/**
 * Partage via le menu natif du téléphone (Web Share API avec fichier). Si
 * l'appareil ne supporte pas le partage de fichier (desktop, navigateurs
 * plus anciens), replie sur un téléchargement direct de l'image.
 */
export async function partagerOuTelecharger(blob: Blob, nomFichier: string): Promise<"partage" | "telecharge"> {
  const fichier = new File([blob], nomFichier, { type: "image/png" });

  if (navigator.canShare?.({ files: [fichier] })) {
    await navigator.share({ files: [fichier], title: "Mon assiette sur Assiettly" });
    return "partage";
  }

  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
  return "telecharge";
}
