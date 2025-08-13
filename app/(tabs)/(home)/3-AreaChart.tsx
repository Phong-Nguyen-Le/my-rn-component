import AreaChart from "@/components/AreaChart.tsx/AreaChart";
import BarChartComponent from "@/components/BarChart.tsx/BarChartComponent";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const Chart = () => {
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: "white" }}>
        <AreaChart />
      </View>

      <View style={{ height: 10 }}></View>

      <View style={{ backgroundColor: "white" }}>
        <BarChartComponent />
      </View>

      <View style={{ height: 10 }}></View>
    </ScrollView>
  );
};

export default Chart;

const styles = StyleSheet.create({});
