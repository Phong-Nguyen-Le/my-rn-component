import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const ItemCard = ({ width, height }: { width: number; height: number }) => {
  const lineData = [
    { value: 10 },
    { value: 58 },
    { value: 56 },
    { value: 78 },
    { value: 74 },
    { value: 98 },
    { value: 78 },
    { value: 74 },
    { value: 56 },
    { value: 78 },
    { value: 10 },
    { value: 58 },
    { value: 56 },
    { value: 78 },
    { value: 74 },
    { value: 98 },
    { value: 78 },
    { value: 74 },
    { value: 56 },
    { value: 78 },
    { value: 0 },
  ];

  const CARD_WIDTH = width;
  const CARD_HEIGHT = height;
  const POINT_SPACING = CARD_WIDTH / lineData.length;

  return (
    <View
      style={{
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <LinearGradient
        colors={["#E2FFF4", "#FFFFFF"]}
        style={styles.background}
      />
      <View style={{ alignItems: "center", gap: 5, margin: 8 }}>
        <Text
          style={{
            fontSize: 12,
          }}
        >
          SSE
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: "#20A975",
          }}
        >
          3573.21
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Text style={{ fontSize: 12, color: "#20A975" }}>-42.51</Text>
          <Text style={{ fontSize: 12, color: "#20A975" }}>-1.18%</Text>
        </View>
      </View>
      <View style={{ height: 20, marginLeft: -10 }}>
        <LineChart
          isAnimated
          animationDuration={1000}
          areaChart
          data={lineData}
          height={15}
          width={200}
          hideYAxisText
          thickness={2}
          showVerticalLines={false}
          hideAxesAndRules
          spacing={POINT_SPACING}
          initialSpacing={0}
          color1="skyblue"
          textColor1="green"
          hideDataPoints
          dataPointsColor1="blue"
          startFillColor1="#20A97580"
          endFillColor1="#20A97520"
          startOpacity={0.8}
          endOpacity={0.2}
          disableScroll={true}
          overflowBottom={0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
  },
});

export default ItemCard;
