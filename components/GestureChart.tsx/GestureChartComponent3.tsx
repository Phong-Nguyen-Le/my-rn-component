import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  RoundedRect,
  Skia,
  Text,
  useFont,
} from "@shopify/react-native-skia";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { getYForX } from "./getYForX";

const GestureChartComponent3 = ({
  chartData,
  width,
  height,
  deviation = 0.0065,
}: {
  chartData: any;
  width: number;
  height: number;
  deviation: number;
}) => {
  const NUMBER_OF_X_AXIS_POINT = 241;
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (chartData.length === 0) return null;
  const startValue = chartData[0].value;
  const isHideYAxisLabel = true;

  const TOTAL_WIDTH = width - 20;
  const TOTAL_HEIGHT = height;
  const PADDING_TOP = 10;
  const PADDING_RIGHT = 1;

  const NUMBER_OF_Y_AXIS_LABELS = 3;
  const hideAxis = true;
  const hideRules = false;

  const yAxisLabelWidth = isHideYAxisLabel ? 0 : 45;
  const xAxisLabelHeight = 15;
  const chartWidth = TOTAL_WIDTH - yAxisLabelWidth - PADDING_RIGHT;
  const chartHeight = TOTAL_HEIGHT - xAxisLabelHeight;
  const curved = true;
  const MAX_VALUE = startValue * (1 + deviation);
  const MIN_VALUE = startValue / (1 + deviation);

  const labelColor = "#999999";
  const connectorLineColor = "#000";

  // Chart calculations
  const xSpacing = chartWidth / (NUMBER_OF_X_AXIS_POINT - 1);
  const yScale = chartHeight / (MAX_VALUE - MIN_VALUE);

  const yLabelStep = (MAX_VALUE - MIN_VALUE) / (NUMBER_OF_Y_AXIS_LABELS - 1);
  const getYAxisLabels = () => {
    const labels = [];
    for (let value = MIN_VALUE; value <= MAX_VALUE; value += yLabelStep) {
      labels.push(value);
    }
    return labels;
  };
  const yAxisLabels = getYAxisLabels();

  const xAxisLabels = [
    {
      label: "09:30",
      index: 0,
    },
    {
      label: "11:30/13:00",
      index: 120,
    },
    {
      label: "15:00",
      index: 240,
    },
  ];

  // const getBasePath = () => {

  // };

  const getBasePath = useCallback(() => {
    const yScale = chartHeight / (MAX_VALUE - MIN_VALUE || 1);
    let path = `M ${yAxisLabelWidth} ${
      chartHeight - (startValue - MIN_VALUE) * yScale
    }`;
    for (let i = 0; i < chartData.length - 1; i++) {
      const x1 = yAxisLabelWidth + i * xSpacing;
      const y1 = chartHeight - (chartData[i].value - MIN_VALUE) * yScale;
      const x2 = yAxisLabelWidth + (i + 1) * xSpacing;
      const y2 = chartHeight - (chartData[i + 1].value - MIN_VALUE) * yScale;

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
  }, [chartData, chartWidth, chartHeight, yAxisLabelWidth, curved]);

  const getAreaPath = () => {
    const yScale = chartHeight / (MAX_VALUE - MIN_VALUE || 1);

    // Path for the line
    let path = `M ${yAxisLabelWidth} ${
      chartHeight - (startValue - MIN_VALUE) * yScale
    }`;
    for (let i = 0; i < chartData.length - 1; i++) {
      const x1 = yAxisLabelWidth + i * xSpacing;
      const y1 = chartHeight - (chartData[i].value - MIN_VALUE) * yScale;
      const x2 = yAxisLabelWidth + (i + 1) * xSpacing;
      const y2 = chartHeight - (chartData[i + 1].value - MIN_VALUE) * yScale;
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

    const lastX = yAxisLabelWidth + (chartData.length - 1) * xSpacing;
    path += ` L ${lastX} ${chartHeight}`;
    path += ` L ${yAxisLabelWidth} ${chartHeight}`;
    path += " Z";

    return path;
  };

  const indicatorX = useSharedValue(yAxisLabelWidth);
  const indicatorY = useSharedValue(0);
  const indicatorActive = useSharedValue(false);
  const isDragging = useSharedValue(false);
  const commands = useSharedValue<any[]>([]);

  useEffect(() => {
    const path = Skia.Path.MakeFromSVGString(getBasePath());
    if (path) {
      commands.value = path.toCmds();
    }
  }, [getBasePath]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      indicatorActive.value = true;
    })
    .onChange((event) => {
      if (indicatorActive.value) {
        const newX = Math.max(
          yAxisLabelWidth,
          Math.min(yAxisLabelWidth + chartData.length * xSpacing, event.x)
        );
        indicatorX.value = newX;
        const y = getYForX(commands.value, newX);
        if (y !== undefined) indicatorY.value = y;

        let idx = Math.round((newX - yAxisLabelWidth) / xSpacing);
        idx = Math.max(0, Math.min(chartData.length - 1, idx));
        runOnJS(setSelectedIndex)(idx);
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      indicatorActive.value = false;
    });

  const composedGesture = Gesture.Race(panGesture);

  const verticalLinePath = useDerivedValue(() => {
    return `M ${indicatorX.value} 0 L ${indicatorX.value} ${chartHeight}`;
  });

  const horizontalLinePath = useDerivedValue(() => {
    return `M ${yAxisLabelWidth} ${indicatorY.value} L ${
      chartWidth + yAxisLabelWidth
    } ${indicatorY.value}`;
  });

  const dashPaint = useDerivedValue(() => {
    const paint = Skia.Paint();
    paint.setStyle(1);
    paint.setStrokeWidth(0.5);
    paint.setColor(Skia.Color(connectorLineColor));
    paint.setPathEffect(Skia.PathEffect.MakeDash([1, 1], 0));
    paint.setAlphaf(indicatorActive.value ? 1 : 0);
    return paint;
  }, [indicatorActive]);
  const font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"), 10);

  const horizontalRulesPaint = Skia.Paint();
  horizontalRulesPaint.setStyle(1);
  horizontalRulesPaint.setStrokeWidth(0.5);
  horizontalRulesPaint.setColor(Skia.Color("#D9D9D9"));

  const verticalRulesPaint = Skia.Paint();
  verticalRulesPaint.setStyle(1);
  verticalRulesPaint.setStrokeWidth(0.5);
  verticalRulesPaint.setColor(Skia.Color("#D9D9D9"));

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

  const percentText = useDerivedValue(() => {
    return `${(
      ((chartData[currentIndex.value].value - startValue) * 100) /
      startValue
    ).toFixed(2)}%`;
  }, [currentIndex, chartData]);

  const usedZones: any = [];
  let eventIdx = -1;
  const fontEvent = useFont(
    require("../../assets/fonts/SpaceMono-Regular.ttf"),
    7
  );

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

            {!isHideYAxisLabel &&
              yAxisLabels.map((label) => {
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
                    path={`M ${yAxisLabelWidth} ${y} L ${
                      chartWidth + yAxisLabelWidth
                    } ${y}`}
                    style="stroke"
                    paint={horizontalRulesPaint}
                  />
                );
              })}

            {!hideRules &&
              xAxisLabels.map((item, index) => {
                const x = yAxisLabelWidth + item.index * xSpacing;
                const y = chartHeight;
                return (
                  <Path
                    key={`x-dash-${index}`}
                    path={`M ${x} 0 L ${x} ${y}`}
                    style="stroke"
                    paint={verticalRulesPaint}
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
                finalX -= 30;
              } else {
                finalX -= 33;
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
              path={getBasePath()}
              style="stroke"
              strokeWidth={1}
              color="#0000FF"
            />

            <Path path={getAreaPath()}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: chartHeight }}
                colors={["#1C6CF366", "#1C6CF310"]}
              />
            </Path>

            {chartData.map((point, i) => {
              if (!point.event) return null;
              const [line1, line2] = splitContentToTwoLines(
                point.event.content
              );
              eventIdx++;
              const r = 2;
              const x = yAxisLabelWidth + i * xSpacing;
              const y = chartHeight - (point.value - MIN_VALUE) * yScale;
              const isUp = eventIdx % 2 === 0;
              // 1. Tính chiều rộng thực tế của text
              const padding = 10;
              const textMerics = fontEvent?.measureText(
                line1.length > line2.length ? line1 : line2
              );
              const containerWidth = (textMerics?.width || 0) + padding;
              const containerHeight = (textMerics?.height || 0) * 2 || 20;
              let offsetY = isUp ? -35 : 10;
              let containerX = x;
              if (containerX + containerWidth > chartWidth) {
                containerX = x - containerWidth;
              }
              let containerY = findBestOffsetY(
                y + offsetY,
                containerX,
                containerWidth,
                containerHeight,
                usedZones
              );
              containerY = Math.max(
                0,
                Math.min(containerY, chartHeight - containerHeight)
              );

              usedZones.push({
                x: containerX,
                y: containerY,
                width: containerWidth,
                height: containerHeight,
              });

              const isSelected = selectedIndex === i;
              const bgColor = isSelected
                ? point.event.type === "green"
                  ? "#007d41"
                  : "#FF3B30"
                : point.event.type === "green"
                ? "#20A97533"
                : "#EE3A3533";
              const borderColor =
                point.event.type === "green" ? "#00C985" : "#FF3B30";
              const textColor = isSelected
                ? "#fff"
                : point.event.type === "green"
                ? "#22875E"
                : "#C80000";

              const bgDot =
                point.event.type === "green" ? "#007d41" : "#FF3B30";

              return (
                <Group key={`event-dot-${i}`}>
                  {/* Connector */}
                  <Path
                    path={`M ${x} ${y} L ${x} ${
                      containerY + (isUp ? containerHeight : 0)
                    }`}
                    color={borderColor}
                    style="stroke"
                    strokeWidth={1}
                  />
                  {/* Small Dot */}
                  <Path
                    path={Skia.Path.Make().addCircle(x, y, r)}
                    color={bgDot}
                    style="fill"
                  />
                  {/* Container (RoundedRect) */}
                  <RoundedRect
                    x={containerX}
                    y={containerY}
                    width={containerWidth}
                    height={containerHeight}
                    r={3}
                    color={bgColor}
                    style="fill"
                  />
                  <RoundedRect
                    x={containerX}
                    y={containerY}
                    width={containerWidth}
                    height={containerHeight}
                    r={3}
                    color={borderColor}
                    style="stroke"
                    strokeWidth={1}
                  />
                  <Text
                    x={containerX + padding / 2}
                    y={containerY + 7}
                    text={line1}
                    color={textColor}
                    font={fontEvent}
                  />
                  <Text
                    x={containerX + padding / 2}
                    y={containerY + 14}
                    text={line2}
                    color={textColor}
                    font={fontEvent}
                  />
                </Group>
              );
            })}

            <Group
              opacity={useDerivedValue(() => (indicatorActive.value ? 1 : 0))}
            >
              {/* Vertical line and label */}
              <Path path={verticalLinePath} style="stroke" paint={dashPaint} />
              <RoundedRect
                x={useDerivedValue(() =>
                  Math.min(indicatorX.value - 20, chartWidth - 40)
                )}
                y={chartHeight - 15}
                width={40}
                height={15}
                r={2}
                color={"blue"}
              />
              <Text
                x={useDerivedValue(() =>
                  Math.min(indicatorX.value - 20 + 4, chartWidth - 36)
                )}
                y={chartHeight - 4}
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
                width={45}
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

              <RoundedRect
                x={chartWidth + yAxisLabelWidth - 40}
                y={useDerivedValue(() => indicatorY.value - 7.5)}
                width={45}
                height={15}
                r={2}
                color={"blue"}
              />
              <Text
                x={chartWidth + yAxisLabelWidth - 38}
                y={useDerivedValue(() => indicatorY.value + 3)}
                text={percentText}
                color="#FFFFFF"
                font={font}
              />

              <Circle
                cx={indicatorX}
                cy={indicatorY}
                r={2}
                color="#FF3B30"
              ></Circle>
            </Group>

            <Text
              x={yAxisLabelWidth}
              y={7}
              text={MAX_VALUE.toFixed(2).toString()}
              color="#EE3A35"
              font={font}
            />

            <Text
              x={yAxisLabelWidth}
              y={chartHeight / 2 + 10}
              text={MAX_VALUE.toFixed(2).toString()}
              color="#666666"
              font={font}
            />

            <Text
              x={chartWidth + yAxisLabelWidth - 40}
              y={7}
              text={`+${(deviation * 100).toFixed(2).toString()}%`}
              color="#EE3A35"
              font={font}
            />

            <Text
              x={yAxisLabelWidth}
              y={chartHeight}
              text={MIN_VALUE.toFixed(2).toString()}
              color="#20A975"
              font={font}
            />

            <Text
              x={chartWidth + yAxisLabelWidth - 40}
              y={chartHeight}
              text={`-${(deviation * 100).toFixed(2).toString()}%`}
              color="#20A975"
              font={font}
            />

            <Text
              x={chartWidth + yAxisLabelWidth - 40}
              y={chartHeight / 2 + 10}
              text={`0.00%`}
              color="#666666"
              font={font}
            />
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "white",
  },
});

export default GestureChartComponent3;

function splitContentToTwoLines(content: string) {
  const words = content.trim().split(" ");
  if (words.length <= 1) return [content, ""];

  let bestSplit = 1;
  let minDiff = Infinity;

  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(" ");
    const line2 = words.slice(i).join(" ");
    const diff = Math.abs(line1.length - line2.length);

    if (diff < minDiff) {
      minDiff = diff;
      bestSplit = i;
    }
  }

  return [
    words.slice(0, bestSplit).join(" "),
    words.slice(bestSplit).join(" "),
  ];
}

function isOverlap(a, b, minGap = 0) {
  return !(
    a.x + a.width + minGap <= b.x ||
    a.x >= b.x + b.width + minGap ||
    a.y + a.height + minGap <= b.y ||
    a.y >= b.y + b.height + minGap
  );
}

// Hàm tìm vị trí offset
function findBestOffsetY(
  y,
  containerX,
  containerWidth,
  containerHeight,
  usedZones,
  maxStep = 5,
  minGap = 2
) {
  const candidates = [];
  for (let step = 0; step <= maxStep; step++) {
    for (let dir of [-1, 1]) {
      if (step === 0 && dir === 1) continue;
      const offset = dir * step * (containerHeight + minGap);
      const testY = y + offset;
      const testZone = {
        x: containerX,
        y: testY,
        width: containerWidth,
        height: containerHeight,
      };
      const isOverlapAny = usedZones.some((zone) =>
        isOverlap(testZone, zone, minGap)
      );
      if (!isOverlapAny) {
        candidates.push({
          offset,
          absOffset: Math.abs(offset),
          testY,
        });
      }
    }
    if (step === 0) {
      const testZone = {
        x: containerX,
        y: y,
        width: containerWidth,
        height: containerHeight,
      };
      const isOverlapAny = usedZones.some((zone) =>
        isOverlap(testZone, zone, minGap)
      );
      if (!isOverlapAny) {
        candidates.push({
          offset: 0,
          absOffset: 0,
          testY: y,
        });
      }
    }
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.absOffset - b.absOffset);
    return candidates[0].testY;
  }
  return y;
}
