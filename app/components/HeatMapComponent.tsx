import { hierarchy, treemap, treemapBinary } from "d3-hierarchy";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

export type HeatMapDatum = {
  name: string;
  category?: string;
  value: number;
  units?: string;
  pct_change?: number;
};

type HeatMapComponentProps = {
  data: HeatMapDatum[];
  width?: number;
  height?: number;
  isLoading?: boolean;
  onItemPress?: (item: HeatMapDatum) => void;
};

const DEFAULT_WIDTH = 350;
const DEFAULT_HEIGHT = 200;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HeatMapComponent: React.FC<HeatMapComponentProps> = ({
  data,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  isLoading = false,
  onItemPress,
}) => {
  const { leafNodes } = useMemo(() => {
    const hierarchicalData = {
      name: "root",
      children: data
        .map((item) => ({
          name: item.name,
          category: item.category,
          value: item.value,
          units: item.units,
          pct_change: item.pct_change,
        }))
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    };

    const root = hierarchy(hierarchicalData)
      .sum((d: any) => d.value || 0)
      .sort((a: any, b: any) => b.value - a.value);

    const treemapGenerator = treemap()
      .tile(treemapBinary)
      .size([width, height])
      .paddingInner(1)
      .round(true);

    treemapGenerator(root as any);

    return {
      leafNodes: root.leaves(),
      rawDataLength: data.length,
    };
  }, [data, width, height]);

  const getCellStyle = (item: HeatMapDatum) => {
    const change = item.pct_change ?? 0;
    if (change > 0) {
      return { backgroundColor: "#ffebee" };
    }
    if (change < 0) {
      return { backgroundColor: "#e8f5e8" };
    }
    return { backgroundColor: "#f5f5f5" };
  };

  const getTextColor = (item: HeatMapDatum) => {
    const change = item.pct_change ?? 0;
    if (change > 0) {
      return "#d32f2f";
    }
    if (change < 0) {
      return "#2e7d32";
    }
    return "#424242";
  };

  const formatPercentageChange = (value?: number) => {
    if (value === undefined || value === null) {
      return "";
    }
    if (value === 0) {
      return "0%";
    }
    const absValue = Math.abs(value).toFixed(2).replace(/\.00$/, "");
    const sign = value > 0 ? "+" : "-";
    return `${sign}${absValue}%`;
  };

  return (
    <View style={[styles.treemapContainer, { width, height }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1976d2" />
        </View>
      ) : (
        <>
          {leafNodes
            .map((node: any, index: number) => {
              const dataNode: HeatMapDatum = node.data;
              const rect = {
                x0: Math.max(0, Math.min(node.x0, width)),
                y0: Math.max(0, Math.min(node.y0, height)),
                x1: Math.max(0, Math.min(node.x1, width)),
                y1: Math.max(0, Math.min(node.y1, height)),
              };

              const rectWidth = Math.max(0, rect.x1 - rect.x0);
              const rectHeight = Math.max(0, rect.y1 - rect.y0);

              if (rectWidth < 10 || rectHeight < 10) {
                return null;
              }

              return (
                <AnimatedPressable
                  key={index}
                  style={[
                    styles.treemapRect,
                    {
                      left: rect.x0,
                      top: rect.y0,
                      width: rectWidth,
                      height: rectHeight,
                    },
                    getCellStyle(dataNode),
                  ]}
                  entering={FadeIn.delay(index * 40).springify()}
                  layout={LinearTransition.springify()}
                  exiting={FadeOut}
                  onPress={
                    onItemPress ? () => onItemPress(dataNode) : undefined
                  }
                  disabled={!onItemPress}
                >
                  <Text
                    style={styles.categoryText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    ellipsizeMode="tail"
                  >
                    {dataNode.name}
                  </Text>
                  <Text
                    style={[
                      styles.valueText,
                      { color: getTextColor(dataNode) },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {dataNode.value}
                    {dataNode.units ? ` ${dataNode.units}` : ""}
                  </Text>
                  {dataNode.pct_change !== undefined ? (
                    <Text
                      style={[
                        styles.changeText,
                        { color: getTextColor(dataNode) },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {formatPercentageChange(dataNode.pct_change)}
                    </Text>
                  ) : null}
                </AnimatedPressable>
              );
            })
            .filter(Boolean)}

          {/* {rawDataLength > leafNodes.length && (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackText}>
                {rawDataLength - leafNodes.length} item(s) too small to display
              </Text>
            </View>
          )} */}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  treemapContainer: {
    position: "relative",
    alignSelf: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  treemapRect: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
    marginBottom: 2,
  },
  valueText: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 1,
  },
  changeText: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  fallbackContainer: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 4,
  },
  fallbackText: {
    fontSize: 10,
    color: "#fff",
    textAlign: "center",
  },
});

export default HeatMapComponent;
