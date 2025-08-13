import { TableColumn, TableContainer } from "@/components/CustomTable";
import FreezeTable from "@/components/FreezeTable";
import React, { useRef } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import Animated, {
  useAnimatedStyle,
  useEvent,
  useHandler,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedPager = Animated.createAnimatedComponent(PagerView);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_COUNT = 3;
const TAB_WIDTH = SCREEN_WIDTH / 6;
const TAB_OFFSET = SCREEN_WIDTH / TAB_COUNT;

export default function PaperView() {
  const scrollPosition = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const tabs = ["Tab 1", "Tab 2", "Tab 3"];
  const handler = usePagerScrollHandler({
    onPageScroll: (e: any) => {
      "worklet";
      scrollPosition.value = e.position;
      scrollOffset.value = e.offset;
    },
  });

  const pagerRef = useRef<any>(null);
  const handleTabPress = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const translateX =
      TAB_WIDTH / 2 +
      scrollPosition.value * TAB_OFFSET +
      scrollOffset.value * TAB_OFFSET;
    return {
      transform: [{ translateX }],
      width: TAB_WIDTH,
    };
  });

  const tableData = [
    {
      name: "Hanbao shares",
      nameCode: "SZ301830",
      subscriptionDate: "2025-07-14",
      releaseDate: "2025-07-23",
      stockType: "Ordinary",
    },
    {
      name: "Hanbao shares",
      nameCode: "SZ301831",
      subscriptionDate: "2025-07-15",
      releaseDate: "2025-07-24",
      stockType: "Ordinary",
    },
    {
      name: "Hanbao shares",
      nameCode: "SZ301832",
      subscriptionDate: "2025-07-16",
      releaseDate: "2025-07-25",
      stockType: "Preferred",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => {
              handleTabPress(index);
            }}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
        {/* Animated Indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </View>

      {/* PagerView */}
      <AnimatedPager
        ref={pagerRef}
        testID="pager-view"
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => {
          "worklet";
          console.log("Page selected:", e.nativeEvent.position);
        }}
        onPageScroll={handler}
        overdrag={true}
      >
        <View testID="1" key="1">
          <ScrollView>
            <FreezeTable />
          </ScrollView>
        </View>
        <View testID="2" key="2">
          <ScrollView horizontal>
            <View
              style={{
                width: SCREEN_WIDTH / 2,
                backgroundColor: "red",
              }}
            />
            <View
              style={{
                width: SCREEN_WIDTH / 2,
                backgroundColor: "blue",
              }}
            />
            <View
              style={{
                width: SCREEN_WIDTH / 2,
                backgroundColor: "green",
              }}
            />
          </ScrollView>
        </View>
        <View testID="3" key="3">
          <View style={styles.container}>
            <TableContainer data={tableData}>
              <TableColumn
                freeze
                field="nameCode"
                header={"Name\nCode"}
                width={120}
              >
                {(item) => (
                  <View style={styles.fixedColumnRow}>
                    <Text style={styles.fixedColumnText}>{item.name}</Text>
                    <Text style={[styles.fixedColumnText, styles.nameCodeText]}>
                      {item.nameCode}
                    </Text>
                  </View>
                )}
              </TableColumn>
              <TableColumn
                field="subscriptionDate"
                header={"Subscription\nDate"}
                width={140}
              >
                {(item) => (
                  <Text style={[styles.contentText]}>
                    {item.subscriptionDate}
                  </Text>
                )}
              </TableColumn>
              <TableColumn
                field="releaseDate"
                header={"Release\nDate"}
                width={140}
              >
                {(item) => (
                  <Text style={[styles.contentText]}>{item.releaseDate}</Text>
                )}
              </TableColumn>
              <TableColumn
                field="stockType"
                header={"Stock\nType"}
                cellContainerStyle={{}}
              >
                {(item) => (
                  <Text style={[styles.contentText]}>{item.stockType}</Text>
                )}
              </TableColumn>
            </TableContainer>
          </View>
        </View>
      </AnimatedPager>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 4,
    backgroundColor: "#007AFF",
  },
  pagerView: {
    flex: 1,
  },
  pageText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
  },
  // Custom table

  fixedColumnRow: {
    height: 40,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fixedColumnText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#000000",
  },
  nameCodeText: {
    fontSize: 10,
    lineHeight: 12,
    color: "#999999",
  },
  contentText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#000000",
  },
});

export function usePagerScrollHandler(handlers: any, dependencies?: any) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies);
  const subscribeForEvents = ["onPageScroll"];

  return useEvent<any>(
    (event) => {
      "worklet";
      const { onPageScroll } = handlers;
      if (onPageScroll && event.eventName.endsWith("onPageScroll")) {
        onPageScroll(event, context);
      }
    },
    subscribeForEvents,
    doDependenciesDiffer
  );
}
