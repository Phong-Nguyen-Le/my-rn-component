import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, View } from "react-native";

const Home = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button
        title="Go to Freeze Table"
        onPress={() => {
          router.push("/1-FreezeTable");
        }}
      />

      <Button
        title="Go to Paper View"
        onPress={() => {
          router.push("/2-PaperView");
        }}
      />

      <Button
        title="Go to Animated Tabs"
        onPress={() => {
          router.push("/1-FreezeTable");
        }}
      />

      <Button
        title="Go to Area Chart"
        onPress={() => {
          router.push("/3-AreaChart");
        }}
      />

      <Button
        title="Go to Gesture Chart "
        onPress={() => {
          router.push("/4-GestureChart");
        }}
      />
      <Button
        title="Go to Gesture Chart2"
        onPress={() => {
          router.push("/5-GestureChart");
        }}
      />

      <Button
        title="Go to Gesture Chart with note"
        onPress={() => {
          router.push("/6-GestureChartWithNote");
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
