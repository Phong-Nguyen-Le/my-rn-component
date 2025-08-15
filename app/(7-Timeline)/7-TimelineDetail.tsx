import LockTimelineViews from "@/components/TimeLine/LockTimelineViews";
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const TimelineDetail = () => {
  const router = useRouter();

  const data = Array(240).fill(false);
  [108, 110, 111, 140, 150].forEach((i) => (data[i] = true));

  return (
    <View style={styles.container}>
      <Text>TimelineDetail</Text>
      <Button title="Go back" onPress={() => router.back()} />

      <LockTimelineViews data={data} width={360} height={5} />

      <LockTimelineViews data={data} width={360} height={5} />

      <LockTimelineViews data={data} width={360} height={5} />

      <LockTimelineViews data={data} width={360} height={5} />

      <LockTimelineViews data={data} width={360} height={5} />

      <LockTimelineViews data={data} width={360} height={5} />

      <LockTimelineViews data={data} width={360} height={5} />

      <LockTimelineViews data={data} width={360} height={5} />
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
