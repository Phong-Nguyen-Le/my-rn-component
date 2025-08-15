import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Slider from "@react-native-community/slider";

function SliderHeader({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) {
  const [isPending, startTransition] = React.useTransition();
  console.log("isPending", isPending);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 8,
        }}
      >
        <Text style={{ textAlign: "center" }}>
          Render <Text style={{ fontWeight: "500" }}>{value}</Text> Tiles{" "}
        </Text>
        <ActivityIndicator animating={isPending} />
      </View>

      <Slider
        value={1}
        minimumValue={1}
        maximumValue={1000}
        step={1}
        onValueChange={(newValue) => {
          //   onValueChange(newValue);
          // Mark rendering tiles with new value as transition
          startTransition(() => {
            onValueChange(newValue);
          });
        }}
      />
    </>
  );
}

const Transition = () => {
  const views = [];
  const size = 14;
  const [value, setValue] = React.useState(1);

  for (let i = 0; i < value; ++i) {
    const view = (
      <View
        key={i}
        style={{
          width: size,
          height: size,
          borderWidth: 0.5,
          backgroundColor: "red",
        }}
      />
    );

    views.push(view);
  }

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <SliderHeader onValueChange={setValue} value={value} />
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          flexWrap: "wrap",
        }}
      >
        {views}
      </View>
    </SafeAreaView>
  );
};

export default Transition;

const styles = StyleSheet.create({});
