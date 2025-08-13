import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: true, headerTitle: "Home" }}
      />
      <Stack.Screen
        name="1-FreezeTable"
        options={{ headerShown: true, headerTitle: "Home" }}
      />
    </Stack>
  );
}
