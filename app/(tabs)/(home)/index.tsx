import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Href } from "expo-router";
import React from "react";
import { Button, StyleSheet, View } from "react-native";

const Home = () => {
  const { navigate, isNavigating } = useNavigationGuard();
  const handlePress = (path: Href) => {
    navigate(path);
  };

  return (
    <View style={styles.container}>
      <Button
        title="Go to Freeze Table"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/1-FreezeTable");
        }}
      />

      <Button
        title="Go to Paper View"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/2-PaperView");
        }}
      />

      <Button
        title="Go to Animated Tabs"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/1-FreezeTable");
        }}
      />

      <Button
        title="Go to Area Chart"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/3-AreaChart");
        }}
      />

      <Button
        title="Go to Gesture Chart "
        disabled={isNavigating}
        onPress={() => {
          handlePress("/4-GestureChart");
        }}
      />

      <Button
        title="Go to Gesture Chart2"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/5-GestureChart");
        }}
      />

      <Button
        title="Go to Gesture Chart with note"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/6-GestureChartWithNote");
        }}
      />

      <Button
        title="Go to Time Line"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/(7-Timeline)/7-Timeline");
        }}
      />

      <Button
        title="8. Go to Transition"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/(8-transition)/8-Transition");
        }}
      />

      <Button
        title="9. Go to Expo Secure Store"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/(9-expo-secure-store)/9-expo-secure-store");
        }}
      />

      <Button
        title="10. Go to Pull to Refresh"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/(10-pull-to-refresh)/10-pull-to-refresh");
        }}
      />

      <Button
        title="Test"
        disabled={isNavigating}
        onPress={() => {
          handlePress("/(tabs)/(home)/Test");
        }}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
