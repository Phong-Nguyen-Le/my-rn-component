import GestureChartComponent2 from "@/components/GestureChart.tsx/GestureChartComponent2";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const GestureChart = () => {
  return (
    <View style={{ flex: 1 }}>
      <GestureChartComponent2
        chartData={data}
        dangerZone={danger}
        opportunityZone={opportunity}
        width={width}
        height={200}
        maxValue={22}
        minValue={9}
      />

      <View style={{ height: 30, backgroundColor: "red" }} />
    </View>
  );
};

export default GestureChart;

const styles = StyleSheet.create({});

const data = [
  { value: 13.1, label: "2015-07-01" },
  { value: 17.6, label: "2015-07-02" },
  { value: 12.9, label: "2015-07-03" },
  { value: 10.0, label: "2015-07-04" },
  { value: 16.0, label: "2015-07-05" },
  { value: 18.3, label: "2015-07-06" },
  { value: 15.7, label: "2015-07-07" },
  { value: 16.4, label: "2015-07-08" },
  { value: 12.2, label: "2015-07-09" },
  { value: 14.0, label: "2015-07-10" },
  { value: 17.8, label: "2015-07-11" },
  { value: 14.3, label: "2015-07-12" },
  { value: 20.0, label: "2015-07-13" },
  { value: 11.5, label: "2015-07-14" },
  { value: 17.0, label: "2015-07-15" },
  { value: 13.4, label: "2015-07-16" },
  { value: 18.5, label: "2015-07-17" },
  { value: 12.8, label: "2015-07-18" },
  { value: 16.2, label: "2015-07-19" },
  { value: 14.9, label: "2015-07-20" },
  { value: 18.7, label: "2015-07-21" },
  { value: 13.7, label: "2015-07-22" },
  { value: 15.1, label: "2015-07-23" },
  { value: 17.5, label: "2015-07-24" },
  { value: 16.0, label: "2015-07-25" },
  { value: 14.4, label: "2015-07-26" },
];

const opportunity = [
  { value: 9.5, label: "2015-07-01" },
  { value: 10.0, label: "2015-07-02" },
  { value: 10.3, label: "2015-07-03" },
  { value: 10.5, label: "2015-07-04" },
  { value: 10.6, label: "2015-07-05" },
  { value: 11.2, label: "2015-07-06" },
  { value: 11.0, label: "2015-07-07" },
  { value: 10.8, label: "2015-07-08" },
  { value: 11.1, label: "2015-07-09" },
  { value: 11.3, label: "2015-07-10" },
  { value: 11.5, label: "2015-07-11" },
  { value: 11.6, label: "2015-07-12" },
  { value: 11.8, label: "2015-07-13" },
  { value: 11.9, label: "2015-07-14" },
  { value: 11.7, label: "2015-07-15" },
  { value: 11.8, label: "2015-07-16" },
  { value: 12.1, label: "2015-07-17" },
  { value: 12.0, label: "2015-07-18" },
  { value: 12.2, label: "2015-07-19" },
  { value: 12.5, label: "2015-07-20" },
  { value: 12.6, label: "2015-07-21" },
  { value: 12.8, label: "2015-07-22" },
  { value: 12.7, label: "2015-07-23" },
  { value: 12.9, label: "2015-07-24" },
  { value: 13.0, label: "2015-07-25" },
  { value: 13.1, label: "2015-07-26" },
];

const danger = [
  { value: 18.0, label: "2015-07-01" },
  { value: 18.2, label: "2015-07-02" },
  { value: 18.4, label: "2015-07-03" },
  { value: 18.5, label: "2015-07-04" },
  { value: 18.3, label: "2015-07-05" },
  { value: 18.7, label: "2015-07-06" },
  { value: 18.6, label: "2015-07-07" },
  { value: 18.8, label: "2015-07-08" },
  { value: 18.7, label: "2015-07-09" },
  { value: 18.9, label: "2015-07-10" },
  { value: 19.0, label: "2015-07-11" },
  { value: 18.8, label: "2015-07-12" },
  { value: 18.9, label: "2015-07-13" },
  { value: 19.2, label: "2015-07-14" },
  { value: 19.1, label: "2015-07-15" },
  { value: 19.3, label: "2015-07-16" },
  { value: 19.5, label: "2015-07-17" },
  { value: 19.4, label: "2015-07-18" },
  { value: 19.2, label: "2015-07-19" },
  { value: 19.1, label: "2015-07-20" },
  { value: 18.8, label: "2015-07-21" },
  { value: 18.6, label: "2015-07-22" },
  { value: 18.4, label: "2015-07-23" },
  { value: 18.2, label: "2015-07-24" },
  { value: 18.0, label: "2015-07-25" },
  { value: 17.9, label: "2015-07-26" },
];
