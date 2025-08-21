import PullToRefreshView from "@/components/PullToRefresh/PullToRefreshView";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function PullToRefreshScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      title: `Item ${i + 1}`,
    }))
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };
  return (
    <View style={styles.screen}>
      <PullToRefreshView onRefresh={handleRefresh} refreshing={refreshing}>
        <>
          {data.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {refreshing && <Text style={styles.skeleton}>Loading…</Text>}
            </View>
          ))}
          <View style={{ height: 200, backgroundColor: "red" }} />
          <ScrollView nestedScrollEnabled>
            {data.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {refreshing && <Text style={styles.skeleton}>Loading…</Text>}
              </View>
            ))}
          </ScrollView>
        </>
      </PullToRefreshView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fa" },
  refreshHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#f8f9fa",
    zIndex: 10,
  },
  icon: {
    width: 28,
    height: 28,
    marginBottom: 6,
    tintColor: "#495057",
    resizeMode: "contain",
  },
  iconFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: "#495057",
  },
  hint: { color: "#6c757d", fontSize: 12 },
  listContainer: { flex: 1 },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    color: "#212529",
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "600",
  },
  skeleton: { color: "#adb5bd", fontSize: 12 },
});
