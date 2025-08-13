import ItemCard from "@/components/AreaChart.tsx/ItemCard";
import ScrollViewIndicator from "@/components/AreaChart.tsx/ScrollViewIndicator";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

const AreaChart = () => {
  const data = new Array(4).fill(0);
  const PAGE_PADDING = 12;
  const ITEMS_PER_PAGE = 3;
  const ITEM_WIDTH = 110;
  const ITEM_GAP =
    (SCREEN_WIDTH - ITEM_WIDTH * ITEMS_PER_PAGE - PAGE_PADDING * 2) /
    (ITEMS_PER_PAGE - 1);

  const [activeIndex, setActiveIndex] = useState(0);
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <View style={{ height: 100, marginVertical: 10 }}>
      <ScrollView
        horizontal
        pagingEnabled
        contentContainerStyle={{}}
        style={styles.scrollView}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {data.map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              gap: ITEM_GAP,
              paddingHorizontal: PAGE_PADDING,
            }}
          >
            <ItemCard width={110} height={85} />
            <ItemCard width={110} height={85} />
            <ItemCard width={110} height={85} />
          </View>
        ))}
      </ScrollView>
      <ScrollViewIndicator activeIndex={activeIndex} length={4} />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    width: SCREEN_WIDTH,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
});

export default AreaChart;
