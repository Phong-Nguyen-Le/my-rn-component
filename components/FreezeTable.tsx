import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Row, Table } from "react-native-table-component";

const borderColor = "#C1C0B9";
const primaryColor = "dodgerblue";
const backgroundColor = "#F7F6E7";

export default function FreezeTable() {
  const leftRef = useRef<ScrollView>(null);
  const rightRef = useRef<ScrollView>(null);

  const state = {
    tableHead: [
      "Head1",
      "Head2",
      "Head3",
      "Head4",
      "Head5",
      "Head6",
      "Head7",
      "Head8",
      "Head9",
    ],
    widthArr: [100, 100, 100, 100, 100, 100, 100, 100, 100],
  };

  const headerHeight = 40;
  const leftColumnWidth = 100;

  const recordData = [];
  for (let i = 0; i < 60; i += 1) {
    const rowData = [];
    rowData.push(`Record ${i}`);
    recordData.push(rowData);
  }

  const tableData = [];
  for (let i = 0; i < 60; i += 1) {
    const rowData = [];
    for (let j = 0; j < 9; j += 1) {
      rowData.push(`${i}${j}`);
    }
    tableData.push(rowData);
  }

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#eee",
      }}
    >
      <View
        style={{
          width: leftColumnWidth,
          backgroundColor: "yellow",
          borderRightWidth: 1,
          borderRightColor: borderColor,
        }}
      >
        <ScrollView
          ref={leftRef}
          style={{
            flex: 1,
            backgroundColor: "white",
            position: "relative",
          }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
        >
          <View
            style={{
              height: headerHeight,
              backgroundColor: primaryColor,
              borderBottomWidth: 1,
              borderBottomColor: borderColor,
            }}
          ></View>
          <Table
            borderStyle={{
              borderWidth: 1,
              borderColor,
            }}
          >
            {recordData.map((rowData, index) => (
              <Row
                key={index}
                data={rowData}
                widthArr={[leftColumnWidth]}
                style={[
                  index % 2 ? styles.row : { backgroundColor },
                  { height: 40 },
                ]}
                textStyle={styles.text}
              />
            ))}
          </Table>
        </ScrollView>
      </View>

      {/* Right Column */}
      <ScrollView horizontal={true}>
        <ScrollView
          ref={rightRef}
          style={styles.dataWrapper}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const { y } = e.nativeEvent.contentOffset;

            console.log(
              "e.nativeEvent.contentOffset",
              e.nativeEvent.contentOffset.y
            );
            leftRef.current?.scrollTo({ y, animated: false });
          }}
          stickyHeaderIndices={[0]}
          bounces={false}
        >
          <Table borderStyle={{ borderWidth: 1, borderColor }}>
            <Row
              data={state.tableHead}
              widthArr={state.widthArr}
              style={styles.head}
              textStyle={{ ...styles.text, color: "white" }}
            />
          </Table>
          <Table borderStyle={{ borderWidth: 1, borderColor }}>
            {tableData.map((rowData, index) => (
              <Row
                key={index}
                data={rowData}
                widthArr={state.widthArr}
                style={[
                  index % 2 ? styles.row : { backgroundColor },
                  { height: 40 },
                ]}
                textStyle={styles.text}
              />
            ))}
          </Table>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#eee" },
  head: { height: 40, backgroundColor: primaryColor },
  wrapper: { flexDirection: "row" },
  title: { flex: 1, backgroundColor: "#f6f8fa" },
  row: { height: 40 },
  text: { textAlign: "center" },
  dataWrapper: { marginTop: -1 },
});
