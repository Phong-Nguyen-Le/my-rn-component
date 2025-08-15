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

import {
  MAIN_TAB_SCREEN,
  NOT_FOUND_SCREEN,
  TIMELINE_SCREENS,
  TRANSITION_SCREENS,
} from "@/constants";
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
        <Stack initialRouteName={MAIN_TAB_SCREEN.name}>
          <Stack.Screen
            name={MAIN_TAB_SCREEN.name}
            options={MAIN_TAB_SCREEN.options}
          />

          <Stack.Screen
            name={TIMELINE_SCREENS.TIMELINE.name}
            options={TIMELINE_SCREENS.TIMELINE.options}
          />

          <Stack.Screen
            name={TIMELINE_SCREENS.TIMELINE_DETAIL.name}
            options={TIMELINE_SCREENS.TIMELINE_DETAIL.options}
          />

          <Stack.Screen
            name={TRANSITION_SCREENS.TRANSITION.name}
            options={TRANSITION_SCREENS.TRANSITION.options}
          />

          <Stack.Screen name={NOT_FOUND_SCREEN.name} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
