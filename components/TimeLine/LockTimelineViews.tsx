import { useMemo } from "react";
import { Text, View } from "react-native";

export default function LockTimelineViews({ data, width = 320, height = 10 }) {
  const segments = useMemo(() => {
    const out: { start: number; len: number }[] = [];
    let s = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i] && s === -1) s = i;
      if ((!data[i] || i === data.length - 1) && s !== -1) {
        const end = data[i] ? i + 1 : i;
        out.push({ start: s, len: end - s });
        s = -1;
      }
    }
    return out;
  }, [data]);

  const minuteWidth = width / data.length;

  return (
    <View>
      <View
        style={{
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: "#D9D9D9",
          overflow: "hidden",
        }}
      >
        {segments.map((seg, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: Math.round(seg.start * minuteWidth),
              width: Math.max(1, Math.round(seg.len * minuteWidth)),
              top: 0,
              bottom: 0,
              backgroundColor: "#2F80ED",
              borderRadius: height / 2,
            }}
          />
        ))}
      </View>

      <View
        style={{
          marginTop: 6,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#A3A3A3" }}>09:30</Text>
        <Text style={{ color: "#A3A3A3" }}>11:30/13:00</Text>
        <Text style={{ color: "#A3A3A3" }}>15:00</Text>
      </View>
    </View>
  );
}
