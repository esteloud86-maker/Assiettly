import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { estOnboardingComplet, useProfile } from "@/hooks/useProfile";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";
import { AjouterRepasScreen } from "@/screens/journal/AjouterRepasScreen";
import { JournalScreen } from "@/screens/journal/JournalScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { OnboardingScreen } from "@/screens/onboarding/OnboardingScreen";
import { PoidsScreen } from "@/screens/poids/PoidsScreen";
import { ProfilScreen } from "@/screens/profil/ProfilScreen";
import type { AuthStackParamList, JournalStackParamList, TabParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const JournalStackNav = createNativeStackNavigator<JournalStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function JournalNavigator() {
  return (
    <JournalStackNav.Navigator>
      <JournalStackNav.Screen name="Journal" component={JournalScreen} options={{ headerShown: false }} />
      <JournalStackNav.Screen
        name="AjouterRepas"
        component={AjouterRepasScreen}
        options={{ title: "Ajouter un repas" }}
      />
    </JournalStackNav.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: "#F97316" }}>
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="JournalTab" component={JournalNavigator} options={{ title: "Journal" }} />
      <Tab.Screen name="Poids" component={PoidsScreen} />
      <Tab.Screen name="Profil" component={ProfilScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refresh } = useProfile(Boolean(session));

  if (authLoading || (session && profileLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF7ED" }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!session ? (
        <AuthNavigator />
      ) : !estOnboardingComplet(profile) ? (
        <OnboardingScreen onTermine={refresh} />
      ) : (
        <AppTabs />
      )}
    </NavigationContainer>
  );
}
