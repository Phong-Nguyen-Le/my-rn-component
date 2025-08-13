import { ruleTypes } from "gifted-charts-core";
import React from "react";
import { Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const GestureChartComponent = () => {
  const ptData = [
    { value: 160, date: "1 Apr 2022" },
    { value: 180, date: "2 Apr 2022" },
    { value: 190, date: "3 Apr 2022" },
    { value: 180, date: "4 Apr 2022" },
    { value: 140, date: "5 Apr 2022" },
    { value: 145, date: "6 Apr 2022" },
    { value: 160, date: "7 Apr 2022" },
    { value: 200, date: "8 Apr 2022" },

    { value: 220, date: "9 Apr 2022" },
    {
      value: 240,
      date: "10 Apr 2022",
      label: "10 Apr",
      labelTextStyle: { color: "lightgray", width: 60 },
    },
    { value: 280, date: "11 Apr 2022" },
    { value: 260, date: "12 Apr 2022" },
    { value: 340, date: "13 Apr 2022" },
    { value: 385, date: "14 Apr 2022" },
    { value: 280, date: "15 Apr 2022" },
    { value: 390, date: "16 Apr 2022" },

    { value: 370, date: "17 Apr 2022" },
    { value: 285, date: "18 Apr 2022" },
    { value: 295, date: "19 Apr 2022" },
    {
      value: 300,
      date: "20 Apr 2022",
      label: "20 Apr",
      labelTextStyle: { color: "lightgray", width: 60 },
    },
    { value: 280, date: "21 Apr 2022" },
    { value: 295, date: "22 Apr 2022" },
    { value: 260, date: "23 Apr 2022" },
    { value: 255, date: "24 Apr 2022" },

    { value: 190, date: "25 Apr 2022" },
    { value: 220, date: "26 Apr 2022" },
    { value: 205, date: "27 Apr 2022" },
    { value: 230, date: "28 Apr 2022" },
    { value: 210, date: "29 Apr 2022" },
    {
      value: 200,
      date: "30 Apr 2022",
      label: "30 Apr",
      labelTextStyle: { color: "lightgray", width: 60 },
    },
    { value: 240, date: "1 May 2022" },
    { value: 250, date: "2 May 2022" },
    { value: 280, date: "3 May 2022" },
    { value: 250, date: "4 May 2022" },
    { value: 210, date: "5 May 2022" },
  ];

  const lineData2 = [
    { value: 120 },
    { value: 90 },
    { value: 140 },
    { value: 150 },
    { value: 120 },
    { value: 170 },
    { value: 180 },
    { value: 190 },
    { value: 120 },
    { value: 90 },
    { value: 140 },
    { value: 150 },
    { value: 120 },
    { value: 170 },
    { value: 180 },
    { value: 190 },
    { value: 120 },
    { value: 90 },
    { value: 140 },
    { value: 150 },
    { value: 120 },
    { value: 170 },
    { value: 180 },
    { value: 190 },
    { value: 120 },
    { value: 90 },
    { value: 140 },
    { value: 150 },
    { value: 120 },
    { value: 170 },
    { value: 180 },
    { value: 190 },
    { value: 120 },
    { value: 90 },
    { value: 140 },
    { value: 150 },
  ];

  const lineData3 = [
    { value: 300 },
    { value: 351 },
    { value: 290 },
    { value: 270 },
    { value: 90 },
    { value: 100 },
    { value: 110 },
    { value: 120 },
    { value: 130 },
    { value: 140 },
    { value: 150 },
    { value: 160 },
    { value: 170 },
    { value: 180 },
    { value: 190 },
    { value: 200 },
    { value: 210 },
    { value: 220 },
    { value: 230 },
    { value: 240 },
  ];
  return (
    <View
      style={{
        paddingVertical: 50,
        paddingLeft: 20,
      }}
    >
      <LineChart
        backgroundColor={"#EE3A3566"}
        zIndex1={3}
        zIndex2={1}
        zIndex3={2}
        data={ptData}
        rotateLabel
        initialSpacing={0}
        width={300}
        height={200}
        stepValue={100}
        maxValue={400}
        // noOfSections={7}
        // stepValue={100}
        spacing={8}
        hideDataPoints
        color="blue"
        thickness={1}
        startFillColor="#fff"
        endFillColor="#fff"
        areaChart2
        data2={lineData3}
        color2="#ffffff20"
        startFillColor2="#fff"
        endFillColor2="#fff"
        startOpacity2={1}
        endOpacity2={1}
        areaChart3
        data3={lineData2}
        startFillColor3="#20A975"
        endFillColor3="#20A97540"
        color3="#20A975"
        startOpacity={1}
        endOpacity={1}
        yAxisColor="black"
        yAxisThickness={0}
        rulesType={ruleTypes.DASHED}
        rulesThickness={1}
        rulesColor="gray"
        // hideRules
        // rulesConfigArray={[{ dashWidth: 0. }, { dashWidth: 2 }]}
        yAxisTextStyle={{ color: "#999999", fontSize: 10 }}
        yAxisTextNumberOfLines={2}
        yAxisLabelWidth={30}
        yAxisSide={0}
        xAxisThickness={1}
        xAxisColor={"lightgray"}
        xAxisType="dashed"
        pointerConfig={{
          strokeDashArray: [2, 2],
          horizontalStripConfig: {
            color: "blue",
            thickness: 1,
            labelComponent: (items) => {
              return (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "blue",
                    position: "absolute",
                    paddingVertical: 2,
                    width: 40,
                    top: 3,
                  }}
                >
                  <Text style={{ fontSize: 8, color: "white" }}>{"10.00"}</Text>
                </View>
              );
            },
          },
          pointerStripColor: "blue",
          pointerStripWidth: 1,
          pointerColor: "lightgray",
          radius: 6,
          shiftPointerLabelX: -18,
          shiftPointerLabelY: 12,

          // activatePointersOnLongPress: true,
          // autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: (items) => {
            return (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "blue",
                  position: "absolute",
                  paddingVertical: 2,
                  width: 60,
                }}
              >
                <Text style={{ fontSize: 8, color: "white" }}>
                  {"2023-04-03"}
                </Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
};

export default GestureChartComponent;
