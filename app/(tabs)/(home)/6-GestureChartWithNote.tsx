import GestureChartComponent3 from "@/components/GestureChart.tsx/GestureChartComponent3";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

function useRealtimeChartData() {
  const eventList = [
    { type: "green", content: "Ground weapons dropped sharply" },
    { type: "green", content: "Ground weapons dropped sharply" },
    { type: "red", content: "Animal health surges" },
    { type: "red", content: "Photovoltaic equipment prices rose sharply" },
    { type: "red", content: "Other home appliances rose sharply" },
    { type: "red", content: "Traditional Chinese medicine hits 60-day high" },
    { type: "red", content: "Chinese medicine prices rose sharply" },
  ];

  function generateTimes(start, end) {
    const result = [];
    let [h, m] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    while (h < endH || (h === endH && m <= endM)) {
      result.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
      m += 1;
      if (m === 60) {
        h += 1;
        m = 0;
      }
    }
    return result;
  }
  const morning = generateTimes("09:30", "11:30");
  const afternoon = generateTimes("13:01", "15:00");
  const timeLabels = [...morning, ...afternoon];

  // --- Quan trọng: Tính vị trí các event, cách nhau ít nhất minGap ---
  const minGap = 15; // Cách nhau tối thiểu 15 điểm
  function getEventPositions(eventCount, dataLength, minGap) {
    const positions = [];
    let lastPos = -minGap;
    for (let i = 0; i < eventCount; i++) {
      // Chọn khoảng đều nhưng thêm một chút random (tuỳ ý)
      const minPos = lastPos + minGap;
      // chia đều ra hết mảng:
      const maxPos =
        Math.floor((dataLength - minPos) / (eventCount - i)) + minPos;
      const pos = Math.floor(
        minPos + Math.random() * Math.max(1, maxPos - minPos - minGap)
      );
      positions.push(pos);
      lastPos = pos;
    }
    return positions;
  }

  // Sinh vị trí event duy nhất 1 lần
  const eventPositionsRef = useRef(null);
  if (!eventPositionsRef.current) {
    eventPositionsRef.current = getEventPositions(
      eventList.length,
      timeLabels.length,
      minGap
    );
  }
  const eventPositions = eventPositionsRef.current;

  // --- Logic random giá và event ---
  const startValue = 3622,
    min = 3614,
    max = 3629;
  function nextRandom(prev) {
    let delta = (Math.random() - 0.5) * 2;
    let next = Math.min(max, Math.max(min, prev + delta));
    return Number(next.toFixed(2));
  }

  const [data, setData] = useState([
    { label: timeLabels[0], value: startValue },
  ]);
  const eventCount = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        if (prevData.length >= timeLabels.length) {
          clearInterval(interval);
          return prevData;
        }
        const last = prevData[prevData.length - 1];
        const nextValue = nextRandom(last.value);
        const nextLabel = timeLabels[prevData.length];
        let point = { label: nextLabel, value: nextValue };
        // Chỉ gán event nếu đến đúng vị trí đã tính
        if (
          eventCount.current < eventList.length &&
          prevData.length === eventPositions[eventCount.current]
        ) {
          point.event = eventList[eventCount.current];
          eventCount.current += 1;
        }
        return [...prevData, point];
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return data;
}

export function useRealtimeDeviation(interval = 5000) {
  const base = 0.0065;
  const delta = 0.0005;

  function randomDeviation() {
    return Number((base + (Math.random() * 2 - 1) * delta).toFixed(6));
  }

  const [deviation, setDeviation] = useState(randomDeviation());

  useEffect(() => {
    const timer = setInterval(() => {
      setDeviation(randomDeviation());
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return deviation;
}

const GestureChartWithNote = () => {
  const data = useRealtimeChartData();
  const deviation = useRealtimeDeviation();

  return (
    <View style={styles.container}>
      <GestureChartComponent3
        chartData={data}
        width={width}
        height={200}
        deviation={deviation}
      />
    </View>
  );
};

export default GestureChartWithNote;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
