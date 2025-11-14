import React from "react";
import { StyleSheet, Text, View } from "react-native";

import HeatMapComponent, {
  HeatMapDatum,
} from "../../components/HeatMapComponent";

const MAP_WIDTH = 350;
const MAP_HEIGHT = 200;

const rawData: HeatMapDatum[] = [
  {
    name: "Technology",
    category: "IT Services",
    value: 3900,
    units: "billion",
    pct_change: 0.54,
  },
  {
    name: "Marketing",
    category: "Advertising",
    value: 1944,
    units: "billion",
    pct_change: 0.54,
  },
  {
    name: "Software",
    category: "Software (Apps)",
    value: 1361,
    units: "billion",
    pct_change: 0.84,
  },
  {
    name: "Software",
    category: "Large State Apps",
    value: 1361,
    units: "billion",
    pct_change: 0.84,
  },
  {
    name: "Hardware",
    category: "Ground Equipment",
    value: 817,
    units: "billion",
    pct_change: 4.84,
  },
  {
    name: "Hardware",
    category: "Computer Components",
    value: 817,
    units: "billion",
    pct_change: -0.37,
  },
  {
    name: "Hardware",
    category: "Joint Systems",
    value: 300,
    units: "billion",
    pct_change: -0.37,
  },
];

const HeatMap = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HeatMap (D3 Treemap)</Text>
      <HeatMapComponent
        data={rawData}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        isLoading={isLoading}
        onItemPress={(item) => {
          console.log("Item pressed", item);
        }}
      />
    </View>
  );
};

export default HeatMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
