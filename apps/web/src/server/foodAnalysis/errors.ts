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
