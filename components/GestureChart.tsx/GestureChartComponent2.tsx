import {
  Canvas,
  Group,
  Path,
  RoundedRect,
  Skia,
  Text,
  useFont,
} from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

const GestureChartComponent2 = ({
  chartData,
  dangerZone,
  opportunityZone,
  width,
  height,
  maxValue,
  minValue,
}: {
  chartData: any;
  dangerZone: any;
  opportunityZone: any;
  width: number;
  height: number;
  maxValue: number;
  minValue: number;
}) => {
  const TOTAL_WIDTH = width - 20;
  const TOTAL_HEIGHT = height;
  const PADDING_TOP = 10;
  const PADDING_RIGHT = 1;

  const NUMBER_OF_Y_AXIS_LABELS = 5;
  const NUMBER_OF_X_AXIS_LABELS = 3;
  const hideAxis = true;
  const hideRules = false;

  const yAxisLabelWidth = 35;
  const xAxisLabelHeight = 15;
  const chartWidth = TOTAL_WIDTH - PADDING_RIGHT;
  const chartHeight = TOTAL_HEIGHT - xAxisLabelHeight;
  const curved = true;
  const LONG_PRESS_DURATION = 400;
  const MAX_VALUE = maxValue;
  const MIN_VALUE = minValue;

  const labelColor = "#999999";
  const connectorLineColor = "#000";

  // Chart calculations
  const xSpacing = (chartWidth - yAxisLabelWidth) / (chartData.length - 1);
  const yScale = chartHeight / (MAX_VALUE - MIN_VALUE);
  const yStep = (MAX_VALUE - MIN_VALUE) / (NUMBER_OF_Y_AXIS_LABELS - 1);

  const getYAxisLabels = () => {
    const labels = [];
    for (let value = Math.ceil(MIN_VALUE); value <= MAX_VALUE; value += yStep) {
      labels.push(value);
    }
    return labels;
  };
  const yAxisLabels = getYAxisLabels();

  const getXAxisLabels = () => {
    const labels = [];
    for (let i = 0; i < NUMBER_OF_X_AXIS_LABELS; i++) {
      const idx = Math.round(
        (i * (chartData.length - 1)) / (NUMBER_OF_X_AXIS_LABELS - 1)
      );
      labels.push({
        label: chartData[idx].label,
        index: idx,
      });
    }
    return labels;
  };
  const xAxisLabels = getXAxisLabels();

  const getBasePath = ({
    data,
    minValue,
    curved,
    height,
  }: {
    data: any;
    minValue: number;
    curved: boolean;
    height: number;
  }) => {
    const chartHeight = height;
    const yScale = chartHeight / (MAX_VALUE - minValue || 1);
    let path = `M ${yAxisLabelWidth} ${
      chartHeight - (data[0].value - minValue) * yScale
    }`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = yAxisLabelWidth + i * xSpacing;
      const y1 = chartHeight - (data[i].value - minValue) * yScale;
      const x2 = yAxisLabelWidth + (i + 1) * xSpacing;
      const y2 = chartHeight - (data[i + 1].value - minValue) * yScale;

      if (curved) {
        const controlDistance = xSpacing * 0.3;
        const cx1 = x1 + controlDistance;
        const cy1 = y1;
        const cx2 = x2 - controlDistance;
        const cy2 = y2;
        path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
      } else {
        path += ` L ${x2} ${y2}`;
      }
    }
    return path;
  };

  const indicatorX = useSharedValue(yAxisLabelWidth);
  const indicatorY = useSharedValue(0);
  const indicatorActive = useSharedValue(false);
  const isDragging = useSharedValue(false);

  const longPressGesture = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onStart((event) => {
      indicatorActive.value = true;
      const x = Math.max(yAxisLabelWidth, Math.min(chartWidth, event.x));
      const y = Math.max(0, Math.min(chartHeight, event.y));
      indicatorX.value = x;
      indicatorY.value = y;
    });

  const tapGesture = Gesture.Tap().onStart((event) => {
    if (indicatorActive.value) {
      const x = Math.max(yAxisLabelWidth, Math.min(chartWidth, event.x));
      const y = Math.max(0, Math.min(chartHeight, event.y));
      indicatorX.value = x;
      indicatorY.value = y;
    }
  });

  const getTopAreaPath = () => {
    let path = getBasePath({
      data: dangerZone,
      minValue: MIN_VALUE,
      curved,
      height: chartHeight,
    });
    path += ` L ${chartWidth} 0 L ${yAxisLabelWidth} 0 Z`;
    return path;
  };

  const getBottomAreaPath = () => {
    let path = getBasePath({
      data: opportunityZone,
      minValue: MIN_VALUE,
      curved,
      height: chartHeight,
    });
    path += ` L ${chartWidth} ${chartHeight} L ${yAxisLabelWidth} ${chartHeight} Z`;
    return path;
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
    })
    .onChange((event) => {
      if (indicatorActive.value) {
        const newX = Math.max(yAxisLabelWidth, Math.min(chartWidth, event.x));
        const newY = Math.max(0, Math.min(chartHeight, event.y));
        indicatorX.value = newX;
        indicatorY.value = newY;
      }
    })
    .onEnd(() => {
      isDragging.value = false;
    });

  const composedGesture = Gesture.Race(
    longPressGesture,
    panGesture,
    tapGesture
  );

  const verticalLinePath = useDerivedValue(() => {
    return `M ${indicatorX.value} 0 L ${indicatorX.value} ${chartHeight}`;
  });

  const horizontalLinePath = useDerivedValue(() => {
    return `M ${yAxisLabelWidth} ${indicatorY.value} L ${chartWidth} ${indicatorY.value}`;
  });
  const dashPaint = Skia.Paint();
  dashPaint.setStyle(1);
  dashPaint.setStrokeWidth(0.5);
  dashPaint.setColor(Skia.Color(connectorLineColor));
  dashPaint.setPathEffect(Skia.PathEffect.MakeDash([1, 1], 0));
  const font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"), 10);

  const horizontalRulesPaint = Skia.Paint();
  horizontalRulesPaint.setStyle(1);
  horizontalRulesPaint.setStrokeWidth(0.5);
  horizontalRulesPaint.setColor(Skia.Color("#ABABAB"));
  horizontalRulesPaint.setPathEffect(Skia.PathEffect.MakeDash([5, 5], 0));

  const currentIndex = useDerivedValue(() => {
    let i = Math.round((indicatorX.value - yAxisLabelWidth) / xSpacing);
    i = Math.max(0, Math.min(chartData.length - 1, i));
    return i;
  }, [indicatorX, chartData]);

  const yLabelText = useDerivedValue(() => {
    return `${(
      MIN_VALUE +
      (MAX_VALUE - MIN_VALUE) * ((chartHeight - indicatorY.value) / chartHeight)
    ).toFixed(2)}`;
  }, [indicatorY, chartData]);

  const xLabelText = useDerivedValue(() => {
    return chartData[currentIndex.value].label;
  }, [currentIndex, chartData]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Canvas
          style={{
            width: TOTAL_WIDTH,
            height: TOTAL_HEIGHT + PADDING_TOP,
          }}
        >
          <Group transform={[{ translateX: 0 }, { translateY: PADDING_TOP }]}>
            <Path path={getTopAreaPath()} style="fill" color="#EE3A3566" />

            <Path path={getBottomAreaPath()} style="fill" color="#20A97566" />

            {!hideAxis && (
              <>
                <Path
                  path={`M ${yAxisLabelWidth} 0 L ${yAxisLabelWidth} ${chartHeight}`}
                  style="stroke"
                  strokeWidth={1}
                  color="#222"
                />

                <Path
                  path={`M ${yAxisLabelWidth} ${chartHeight} L ${chartWidth} ${chartHeight}`}
                  style="stroke"
                  strokeWidth={1}
                  color="#222"
                />
              </>
            )}

            {yAxisLabels.map((label) => {
              const y = chartHeight - (label - MIN_VALUE) * yScale;
              return (
                <Text
                  key={`y-${label}`}
                  x={0}
                  y={y + 3}
                  text={label.toFixed(2).toString()}
                  color={labelColor}
                  font={font}
                />
              );
            })}

            {!hideRules &&
              yAxisLabels.map((label, idx) => {
                const y = chartHeight - (label - MIN_VALUE) * yScale;
                return (
                  <Path
                    key={`y-dash-${label}-${idx}`}
                    path={`M ${yAxisLabelWidth} ${y} L ${chartWidth} ${y}`}
                    style="stroke"
                    paint={horizontalRulesPaint}
                  />
                );
              })}

            {xAxisLabels.map((item, index) => {
              const x = yAxisLabelWidth + item.index * xSpacing;
              const isFirst = index === 0;
              const isLast = index === xAxisLabels.length - 1;

              let finalX = x;
              if (isFirst) {
              } else if (isLast) {
                finalX -= 60;
              } else {
                finalX -= 60 / 2;
              }
              return (
                <Text
                  key={`x-${index}`}
                  x={finalX}
                  y={chartHeight + xAxisLabelHeight}
                  text={item.label}
                  color={labelColor}
                  font={font}
                />
              );
            })}

            <Path
              path={getBasePath({
                data: chartData,
                minValue: MIN_VALUE,
                curved,
                height: chartHeight,
              })}
              style="stroke"
              strokeWidth={1}
              color="#0000FF"
            />

            <Group
              opacity={useDerivedValue(() => (indicatorActive.value ? 1 : 0))}
            >
              {/* Vertical line and label */}
              <Path path={verticalLinePath} style="stroke" paint={dashPaint} />
              <RoundedRect
                x={useDerivedValue(() =>
                  Math.min(indicatorX.value - 35, chartWidth - 70)
                )}
                y={0}
                width={70}
                height={15}
                r={2}
                color={"blue"}
              />
              <Text
                x={useDerivedValue(() =>
                  Math.min(indicatorX.value - 35 + 4, chartWidth - 68)
                )}
                y={12}
                text={xLabelText}
                font={font}
                color="#FFFFFF"
              />
              {/* Y Axis label */}
              <Path
                path={horizontalLinePath}
                style="stroke"
                paint={dashPaint}
              />

              <RoundedRect
                x={yAxisLabelWidth}
                y={useDerivedValue(() => indicatorY.value - 7.5)}
                width={35}
                height={15}
                r={2}
                color={"blue"}
              />
              <Text
                x={yAxisLabelWidth + 2}
                y={useDerivedValue(() => indicatorY.value + 3)}
                text={yLabelText}
                color="#FFFFFF"
                font={font}
              />
            </Group>
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});

export default GestureChartComponent2;
