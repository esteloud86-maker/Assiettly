export class ErreurAnalyseImage extends Error {
  constructor(message = "Image invalide ou illisible.") {
    super(message);
    this.name = "ErreurAnalyseImage";
  }
}

export class ErreurQuotaAnthropic extends Error {
  constructor(message = "Quota d'analyse atteint, réessaie dans quelques instants.") {
    super(message);
    this.name = "ErreurQuotaAnthropic";
  }
}

// Exporté séparément : les Server Actions Next.js ne préservent pas la
// classe d'une erreur jusqu'au client (seulement `.message`), donc le
// client compare ce texte exact pour détecter ce cas précis et proposer le
// paywall contextuel plutôt qu'un simple message d'erreur (cf. EcranScan.tsx).
export const MESSAGE_QUOTA_SCAN_GRATUIT =
  "Tu as atteint la limite de 3 scans par jour de l'offre gratuite. Reviens demain, ou passe en Premium pour scanner sans limite.";

export class ErreurQuotaScanGratuit extends Error {
  constructor(message = MESSAGE_QUOTA_SCAN_GRATUIT) {
    super(message);
    this.name = "ErreurQuotaScanGratuit";
  }
}

export class ErreurReponseInvalide extends Error {
  constructor(message = "La réponse de l'analyse n'a pas le format attendu.") {
    super(message);
    this.name = "ErreurReponseInvalide";
  }
}

export class ErreurTimeoutAnalyse extends Error {
  constructor(message = "L'analyse a pris trop de temps, réessaie.") {
    super(message);
    this.name = "ErreurTimeoutAnalyse";
  }
}
