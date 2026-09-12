import type {
  Frein,
  MotivationPrincipale,
  NiveauActivite,
  ObjectifType,
  Sexe,
  TypeAlimentation,
} from "@assiettly/shared";

export interface ProfilOnboarding {
  sexe: Sexe | null;
  dateNaissance: string; // ISO yyyy-mm-dd
  niveauActivite: NiveauActivite | null;
  tailleCm: string;
  poidsKg: string;
  dejaUtiliseAppSuivi: boolean | null;
  suiviParCoach: boolean | null;
  objectifType: ObjectifType | null;
  freins: Frein[];
  poidsCibleKg: string;
  typeAlimentation: TypeAlimentation | null;
  motivationPrincipale: MotivationPrincipale | null;
  notificationsActivees: boolean;
}

export const PROFIL_ONBOARDING_INITIAL: ProfilOnboarding = {
  sexe: null,
  dateNaissance: "",
  niveauActivite: null,
  tailleCm: "",
  poidsKg: "",
  dejaUtiliseAppSuivi: null,
  suiviParCoach: null,
  objectifType: null,
  freins: [],
  poidsCibleKg: "",
  typeAlimentation: null,
  motivationPrincipale: null,
  notificationsActivees: false,
};

export interface EtapeProps {
  profil: ProfilOnboarding;
  majProfil: <K extends keyof ProfilOnboarding>(cle: K, valeur: ProfilOnboarding[K]) => void;
}
