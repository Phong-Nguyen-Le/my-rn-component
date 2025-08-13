import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="(tabs)">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="(7-Timeline)/7-Timeline"
            options={{
              headerShown: true,
              headerBackTitle: "Back",
              headerBackTitleStyle: {},
              headerTitle: "Timeline",
              headerLargeTitle: true,
            }}
          />

          <Stack.Screen
            name="(7-Timeline)/7-TimelineDetail"
            options={{
              headerShown: true,
              headerBackTitle: "Back",
              headerBackTitleStyle: {},
              headerTitle: "Timeline Detail",
              headerLargeTitle: true,
            }}
          />

          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
