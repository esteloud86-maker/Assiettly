import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type JournalStackParamList = {
  Journal: undefined;
  AjouterRepas: undefined;
};

export type TabParamList = {
  Accueil: undefined;
  JournalTab: NavigatorScreenParams<JournalStackParamList>;
  Poids: undefined;
  Profil: undefined;
};
