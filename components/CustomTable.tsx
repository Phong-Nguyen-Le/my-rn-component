import React, { ReactNode, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface TableData {
  [key: string]: string;
}

interface TableColumnProps {
  freeze?: boolean;
  field: string;
  header?: string;
  width?: number;
  children?: (item: TableData) => ReactNode;
  headerChildren?: ReactNode | ((props: { field?: string }) => ReactNode);
  headerStyle?: TextStyle;
  cellStyle?: TextStyle;
  cellContainerStyle?: ViewStyle;
}

interface TableContainerProps {
  data: TableData[];
  children: ReactNode;
}

const DEFAULT_FIXED_COLUMN_WIDTH = 120;
const DEFAULT_SCROLLABLE_COLUMN_WIDTH = 140;
const DEFAULT_ROW_HEIGHT = 40;

const TableContainer = ({ data, children }: TableContainerProps) => {
  const headerScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    source: "header" | "content"
  ) => {
    if (isScrolling.current) return;

    const scrollX = event.nativeEvent.contentOffset.x;
    isScrolling.current = true;

    const targetRef = source === "header" ? contentScrollRef : headerScrollRef;
    targetRef.current?.scrollTo({ x: scrollX, animated: false });

    setTimeout(() => {
      isScrolling.current = false;
    }, 1);
  };

  const columns = React.Children.toArray(
    children
  ) as React.ReactElement<TableColumnProps>[];

  const fixedColumns = columns.filter((child) => child.props.freeze);
  const scrollableColumns = columns.filter((child) => !child.props.freeze);

  return (
    <View style={styles.tableContainer}>
      <ScrollView horizontal>
        <ScrollView
          stickyHeaderIndices={[0]}
          style={styles.tableScroll}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.headerRow}>
              {/* Left */}
              {fixedColumns.map((column, index) => (
                <View
                  key={index}
                  style={[
                    styles.fixedColumn,
                    { width: column.props.width || DEFAULT_FIXED_COLUMN_WIDTH },
                  ]}
                >
                  {column.props.headerChildren ? (
                    typeof column.props.headerChildren === "function" ? (
                      column.props.headerChildren({ field: column.props.field })
                    ) : (
                      column.props.headerChildren
                    )
                  ) : (
                    <Text
                      style={[
                        styles.headerText,
                        {
                          width:
                            column.props.width || DEFAULT_FIXED_COLUMN_WIDTH,
                        },
                        column.props.headerStyle,
                      ]}
                    >
                      {column.props.header}
                    </Text>
                  )}
                </View>
              ))}

              <ScrollView
                horizontal
                ref={headerScrollRef}
                style={styles.headerScrollView}
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => handleScroll(event, "header")}
                scrollEventThrottle={16}
              >
                <View style={styles.headerContent}>
                  {scrollableColumns.map((column, index) => (
                    <View
                      key={index}
                      style={[
                        {
                          width:
                            column.props.width ||
                            DEFAULT_SCROLLABLE_COLUMN_WIDTH,
                        },
                      ]}
                    >
                      {column.props.headerChildren ? (
                        typeof column.props.headerChildren === "function" ? (
                          column.props.headerChildren({
                            field: column.props.field,
                          })
                        ) : (
                          column.props.headerChildren
                        )
                      ) : (
                        <Text
                          style={[
                            styles.headerText,
                            {
                              width:
                                column.props.width ||
                                DEFAULT_SCROLLABLE_COLUMN_WIDTH,
                            },
                            column.props.headerStyle,
                          ]}
                        >
                          {column.props.header}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Content */}
          <View style={[styles.tableContent, { position: "relative" }]}>
            {fixedColumns.map((column, index) => (
              <View
                key={index}
                style={[
                  styles.fixedColumn,
                  { width: column.props.width || DEFAULT_FIXED_COLUMN_WIDTH },
                ]}
              >
                {data.map((item, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={[
                      styles.fixedColumnRow,
                      column.props.cellContainerStyle,
                    ]}
                  >
                    {column.props.children ? (
                      column.props.children(item)
                    ) : (
                      <Text
                        style={[styles.fixedColumnText, column.props.cellStyle]}
                      >
                        {item[column.props.field]}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
            <ScrollView
              horizontal
              ref={contentScrollRef}
              style={styles.contentScrollView}
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => handleScroll(event, "content")}
              scrollEventThrottle={16}
              bounces={false}
            >
              <View>
                {data.map((item, rowIndex) => (
                  <View key={rowIndex} style={styles.contentRow}>
                    {scrollableColumns.map((column, colIndex) => (
                      <View
                        key={colIndex}
                        style={[
                          styles.contentCell,
                          {
                            width:
                              column.props.width ||
                              DEFAULT_SCROLLABLE_COLUMN_WIDTH,
                          },
                          column.props.cellContainerStyle,
                        ]}
                      >
                        {column.props.children ? (
                          column.props.children(item)
                        ) : (
                          <Text
                            style={[styles.contentText, column.props.cellStyle]}
                          >
                            {item[column.props.field]}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const TableColumn = (_props: TableColumnProps) => null;

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tableScroll: {
    flex: 1,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    height: DEFAULT_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  fixedColumn: {
    width: DEFAULT_FIXED_COLUMN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  headerScrollView: {
    flex: 1,
  },
  headerContent: {
    flexDirection: "row",
  },
  headerText: {
    width: DEFAULT_SCROLLABLE_COLUMN_WIDTH,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
    color: "#999999",
    alignSelf: "center",
  },
  tableContent: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  contentScrollView: {
    flex: 1,
  },
  contentRow: {
    flexDirection: "row",
    height: DEFAULT_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contentCell: {
    width: DEFAULT_SCROLLABLE_COLUMN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  contentText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#000000",
    alignSelf: "center",
  },
  fixedColumnRow: {
    height: DEFAULT_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    width: "100%",
  },
  fixedColumnText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#000000",
    alignSelf: "center",
  },
  nameCodeText: {
    fontSize: 10,
    lineHeight: 12,
    color: "#999999",
    alignSelf: "center",
  },
});

export { TableColumn, TableContainer };
