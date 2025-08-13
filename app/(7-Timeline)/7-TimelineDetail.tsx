import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const TimelineDetail = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text>TimelineDetail</Text>
      <Button title="Go back" onPress={() => router.back()} />
    </View>
  );
};

export default TimelineDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
