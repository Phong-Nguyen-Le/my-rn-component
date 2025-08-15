import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

type Props = {
  data: boolean[];
  width?: number;
  height?: number;
  trackColor?: string;
  lockedColor?: string;
  radius?: number;
};

export function LockTimeline({
  data,
  width = 320,
  height = 10,
  trackColor = "#D9D9D9",
  lockedColor = "#2F80ED",
}: Props) {
  // Merge consecutive “true” minutes into segments to draw fewer shapes
  const segments = useMemo(() => {
    const out: { start: number; len: number }[] = [];
    let i = 0;
    const n = data.length;
    while (i < n) {
      while (i < n && !data[i]) i++;
      if (i >= n) break;
      const start = i;
      while (i < n && data[i]) i++;
      out.push({ start, len: i - start });
    }
    return out;
  }, [data]);

  const minuteWidth = width / data.length;

  return (
    <View>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Track */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={2}
          fill={trackColor}
        />
        {/* Locked segments */}
        {segments.map((s, idx) => {
          const x = Math.round(s.start * minuteWidth);
          const w = Math.max(1, Math.round(s.len * minuteWidth));
          return (
            <Rect
              key={idx}
              x={x}
              y={0}
              width={w}
              height={height}
              fill={lockedColor}
            />
          );
        })}
      </Svg>

      {/* Labels */}
      <View style={styles.labels}>
        <Text style={styles.label}>09:30</Text>
        <Text style={styles.label}>11:30/13:00</Text>
        <Text style={styles.label}>15:00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { color: "#A3A3A3" },
});
