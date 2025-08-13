import React, { useRef } from "react";
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
    widthArr: [50, 60, 80, 100, 120, 140, 160, 180, 200],
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

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#eee",
      }}
    >
      {/* Left Column */}
      <View
        style={{
          width: leftColumnWidth,
          backgroundColor: "yellow",
          borderRightWidth: 1,
          borderRightColor: borderColor,
        }}
      >
        {/* Blank Cell */}
        <View
          style={{
            height: headerHeight,
            backgroundColor: primaryColor,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
          }}
        ></View>
        {/* Left Container : scroll synced */}
        <ScrollView
          ref={leftRef}
          style={{
            flex: 1,
            backgroundColor: "white",
          }}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
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
                style={index % 2 ? styles.row : { backgroundColor }}
                textStyle={styles.text}
              />
            ))}
          </Table>
        </ScrollView>
      </View>
      {/* Right Column */}
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        <ScrollView horizontal={true} bounces={false}>
          <View>
            <Table borderStyle={{ borderWidth: 1, borderColor }}>
              <Row
                data={state.tableHead}
                widthArr={state.widthArr}
                style={styles.head}
                textStyle={{ ...styles.text, color: "white" }}
              />
            </Table>
            <ScrollView
              ref={rightRef}
              style={styles.dataWrapper}
              scrollEventThrottle={16}
              bounces={false}
              onScroll={(e) => {
                const { y } = e.nativeEvent.contentOffset;
                leftRef.current?.scrollTo({ y, animated: false });
              }}
            >
              <Table borderStyle={{ borderWidth: 1, borderColor }}>
                {tableData.map((rowData, index) => (
                  <Row
                    key={index}
                    data={rowData}
                    widthArr={state.widthArr}
                    style={index % 2 ? styles.row : { backgroundColor }}
                    textStyle={styles.text}
                  />
                ))}
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#eee" },
  head: { height: 40, backgroundColor: primaryColor },
  wrapper: { flexDirection: "row" },
  title: { flex: 1, backgroundColor: "#f6f8fa" },
  row: { height: 28 },
  text: { textAlign: "center" },
  dataWrapper: { marginTop: -1 },
});
