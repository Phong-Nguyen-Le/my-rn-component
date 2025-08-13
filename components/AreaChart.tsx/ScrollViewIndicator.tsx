import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ScrollViewIndicator = ({
  activeIndex,
  length,
}: {
  activeIndex: number;
  length: number;
}) => {
  const internalActiveIndex = useSharedValue(activeIndex);

  useEffect(() => {
    internalActiveIndex.value = withTiming(activeIndex, { duration: 500 });
  }, [activeIndex, internalActiveIndex]);

  const renderIndicator = () => {
    const indicators = [];
    for (let i = 0; i < length; i++) {
      const animatedStyle = useAnimatedStyle(() => {
        const progress = Math.abs(internalActiveIndex.value - i);
        const isActive = progress < 1 ? 1 - progress : 0;
        const width = interpolate(isActive, [0, 1], [4, 15], "clamp");
        const borderRadius = interpolate(isActive, [0, 1], [6, 10], "clamp");
        const backgroundColor = interpolateColor(
          isActive,
          [0, 1],
          ["#1C6CF320", "#1C6CF3"]
        );

        return {
          width,
          height: 5,
          borderRadius,
          backgroundColor,
        };
      });

      indicators.push(
        <Animated.View key={i} style={[styles.indicator, animatedStyle]} />
      );
    }
    return indicators;
  };

  return <View style={styles.indicatorContainer}>{renderIndicator()}</View>;
};

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  indicator: {
    backgroundColor: "#1C6CF320",
  },
});

export default ScrollViewIndicator;
