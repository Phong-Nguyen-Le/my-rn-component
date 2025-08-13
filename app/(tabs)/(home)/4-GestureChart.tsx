import { getYForX } from "@/components/GestureChart.tsx/getYForX";
import {
  Canvas,
  Circle,
  Group,
  Path,
  RoundedRect,
  Skia,
  Text,
  useFont,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const Chart = () => {
  // Chart dimensions
  const chartWidth = width - 30;
  const chartHeight = 200;
  const yAxisLabelWidth = 30;
  const curved = true;
  const INDICATOR_RADIUS = 7;
  const data = [
    { value: 13.1, label: "2015-07-01" },
    { value: 17.6, label: "2015-07-02" },
    { value: 12.9, label: "2015-07-03" },
    { value: 16, label: "2015-07-03" },
    { value: 18.3, label: "2015-07-04" },
    { value: 15.7, label: "2015-07-05" },
    { value: 16.4, label: "2015-07-06" },
    { value: 12.2, label: "2015-07-07" },
    { value: 14, label: "2015-07-07" },
    { value: 17.8, label: "2015-07-08" },
    { value: 14.3, label: "2015-07-09" },
    { value: 18.9, label: "2015-07-10" },
    { value: 11.5, label: "2015-07-11" },
    { value: 17.0, label: "2015-07-12" },
    { value: 13.4, label: "2015-07-13" },
    { value: 18.5, label: "2015-07-14" },
    { value: 12.8, label: "2015-07-15" },
    { value: 16.2, label: "2015-07-16" },
    { value: 14.9, label: "2015-07-17" },
    { value: 18.7, label: "2015-07-18" },
    { value: 13.7, label: "2015-07-19" },
    { value: 15.1, label: "2015-07-20" },
  ];

  // Scaling factors
  const maxValue = 20;
  const minValue = 9.3;
  const xSpacing = (chartWidth - yAxisLabelWidth) / (data.length - 1);
  const yScale = chartHeight / (maxValue - minValue);
  const step = 2;

  const getYAxisLabels = () => {
    const labels = [];
    for (let value = Math.ceil(minValue); value <= maxValue; value += step) {
      labels.push(value);
    }
    return labels;
  };

  const yAxisLabels = getYAxisLabels();
  const getBasePath = () => {
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

  const getTopAreaPath = () => {
    let path = getBasePath();
    path += ` L ${chartWidth} 0 L ${yAxisLabelWidth} 0 Z`;
    return path;
  };

  const getBottomAreaPath = () => {
    let path = getBasePath();
    path += ` L ${chartWidth} ${chartHeight} L ${yAxisLabelWidth} ${chartHeight} Z`;
    return path;
  };

  const indicatorX = useSharedValue(yAxisLabelWidth);
  const indicatorY = useSharedValue(
    chartHeight - (data[0].value - minValue) * yScale
  );
  const isDragging = useSharedValue(false);
  const commands = useSharedValue<any[]>([]);

  useEffect(() => {
    const path = Skia.Path.MakeFromSVGString(getBasePath());
    if (path) {
      commands.value = path.toCmds();
    }
  }, [data, chartWidth, chartHeight, yAxisLabelWidth, curved]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
    })
    .onChange((event) => {
      const newX = Math.max(
        yAxisLabelWidth,
        Math.min(chartWidth, event.absoluteX)
      );
      indicatorX.value = newX;
      const y = getYForX(commands.value, newX);
      if (y !== undefined) indicatorY.value = y;
    })
    .onEnd(() => {
      let i = Math.round((indicatorX.value - yAxisLabelWidth) / xSpacing);
      i = Math.max(0, Math.min(data.length - 1, i));
      const snapX = yAxisLabelWidth + i * xSpacing;
      indicatorX.value = snapX;
      // Lấy y lại theo curve
      const y = getYForX(commands.value, snapX);
      if (y !== undefined) indicatorY.value = y;
      isDragging.value = false;
    });

  const verticalLinePath = useDerivedValue(() => {
    return `M ${indicatorX.value} 0 L ${indicatorX.value} ${chartHeight}`;
  });

  const horizontalLinePath = useDerivedValue(() => {
    return `M ${yAxisLabelWidth} ${indicatorY.value} L ${chartWidth} ${indicatorY.value}`;
  });
  const dashPaint = Skia.Paint();
  dashPaint.setStyle(1);
  dashPaint.setStrokeWidth(0.5);
  dashPaint.setColor(Skia.Color("#0000FF"));
  dashPaint.setPathEffect(Skia.PathEffect.MakeDash([5, 5], 0));
  const font = useFont(
    require("../../../assets/fonts/SpaceMono-Regular.ttf"),
    10
  );

  const displayText = useDerivedValue(() => {
    let i = Math.round((indicatorX.value - yAxisLabelWidth) / xSpacing);
    i = Math.max(0, Math.min(data.length - 1, i));
    return `$${data[i].value.toFixed(2)}`;
  }, [indicatorX, data]);

  const currentIndex = useDerivedValue(() => {
    let i = Math.round((indicatorX.value - yAxisLabelWidth) / xSpacing);
    i = Math.max(0, Math.min(data.length - 1, i));
    return i;
  }, [indicatorX, data]);

  const valueText = useDerivedValue(() => {
    return `$${data[currentIndex.value].value.toFixed(2)}`;
  }, [currentIndex, data]);

  const labelText = useDerivedValue(() => {
    return data[currentIndex.value].label;
  }, [currentIndex, data]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Canvas
          style={{
            width: chartWidth,
            height: chartHeight + 100,
          }}
        >
          <Path path={getTopAreaPath()} style="fill" color="#EE3A3566" />

          <Path path={getBottomAreaPath()} style="fill" color="#20A97566" />

          <Path
            path={getBasePath()}
            style="stroke"
            strokeWidth={1}
            color="#0000FF"
          />

          <Path path={verticalLinePath} style="stroke" paint={dashPaint} />
          <Path path={horizontalLinePath} style="stroke" paint={dashPaint} />

          <RoundedRect
            x={useDerivedValue(() => indicatorX.value - 20)}
            y={0}
            width={60}
            height={15}
            r={6}
            color={"blue"}
          />

          <Text
            x={useDerivedValue(() => indicatorX.value)}
            y={12}
            text={labelText}
            font={font}
            color="#FFFFFF"
          />

          <RoundedRect
            x={30}
            y={useDerivedValue(() => indicatorY.value - 10)}
            width={40}
            height={20}
            r={6}
            color={"blue"}
            // paint={textBackgroundPaint}
          />

          <Text
            x={useDerivedValue(() => indicatorX.value + 10)}
            y={useDerivedValue(() => indicatorY.value - 30)}
            text={labelText}
            color="#000000"
            font={font}
          />

          <Text
            x={indicatorX}
            y={indicatorY}
            text={displayText}
            color="#000000"
            font={font}
          />

          {yAxisLabels.map((label) => {
            const y = chartHeight - (label - minValue) * yScale;
            return (
              <Text
                key={`y-${label}`}
                x={0}
                y={y + 4}
                text={label.toString()}
                color="#000000"
                font={font}
              />
            );
          })}

          {data.map((item, index) => {
            if (index % 2 !== 0) return null;
            const x = yAxisLabelWidth + index * xSpacing;
            return (
              <Text
                key={`x-${index}`}
                x={x - 10}
                y={chartHeight + 20}
                text={item.label.slice(5)}
                color="#000000"
                font={font}
              />
            );
          })}

          <Group>
            <Circle
              cx={indicatorX}
              cy={indicatorY}
              r={INDICATOR_RADIUS}
              color="#FFFFFF"
            >
              <Circle
                cx={indicatorX}
                cy={indicatorY}
                r={INDICATOR_RADIUS * 0.8}
                color="#0000FF"
              />
            </Circle>
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default Chart;
