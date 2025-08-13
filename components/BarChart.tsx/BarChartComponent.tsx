import React from "react";
import { Dimensions } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";

const SCREEN_WIDTH = Dimensions.get("window").width;

const BarChartComponent = () => {
  const barData: barDataItem[] = [
    {
      value: 49,
      label: "-7%",
      frontColor: "#EE3A35",
    },
    {
      value: 50,
      label: "-5%",
      frontColor: "#EE3A35",
    },
    { value: 64, label: "5-2%", frontColor: "#EE3A35" },
    { value: 244, label: "2-0%", frontColor: "#EE3A35" },
    { value: 654, label: "2-0%", frontColor: "#EE3A35" },
    { value: 63, label: "flat", frontColor: "#999999" },
    { value: 1606, label: "0-2%", frontColor: "#20A975" },
    { value: 200, label: "2-5%", frontColor: "#20A975" },
    { value: 83, label: "5-7%", frontColor: "#20A975" },
    { value: 28, label: "7-6%", frontColor: "#20A975" },
    { value: 30, label: "limit down", frontColor: "#20A975" },
  ];

  const BAR_WIDTH = 20;
  const SPACING =
    (SCREEN_WIDTH - BAR_WIDTH * barData.length) / (barData.length + 1);

  return (
    <BarChart
      isAnimated
      animationDuration={1000}
      data={barData}
      barWidth={BAR_WIDTH}
      height={150}
      noOfSections={5}
      maxValue={2000}
      xAxisTextNumberOfLines={2}
      spacing={SPACING}
      barBorderRadius={4}
      initialSpacing={0}
      showLine={false}
      hideAxesAndRules
      hideYAxisText
      xAxisLabelTextStyle={{ fontSize: 10 }}
      showValuesAsTopLabel
      topLabelTextStyle={{ fontSize: 10 }}
    />
  );
};

export default BarChartComponent;
