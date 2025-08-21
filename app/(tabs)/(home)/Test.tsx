import * as React from "react";
import {
  ImageSourcePropType,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Item = { id: string; title: string };
type Props = ViewProps & {
  data?: Item[];
  onRefresh?: () => Promise<void> | void;
  refreshIcon?: ImageSourcePropType;
};

const MAX_PULL = 200;
const TRIGGER = MAX_PULL / 2; // pull distance to arm refresh
const RESTING_OFFSET_WHEN_REFRESHING = 75;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function CustomPullToRefreshScreen({
  data = Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
    title: `Item ${i + 1}`,
  })),
  onRefresh,
  refreshIcon,
  ...props
}: Props) {
  // Shared values
  const pullDownPosition = useSharedValue(0);
  const scrollPosition = useSharedValue(0);
  const isReadyToRefresh = useSharedValue(false);

  // UI state
  const [refreshing, setRefreshing] = React.useState(false);
  const [hintText, setHintText] = React.useState("Pull to refresh");

  // Track list scroll (only need Y)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollPosition.value = e.contentOffset.y;
    },
  });

  // Update hint text when state changes
  const updateHintText = React.useCallback((text: string) => {
    setHintText(text);
  }, []);

  // Pan responder to capture the extra downward pull
  const onPanRelease = React.useCallback(() => {
    // If armed, park the list partly open and run refresh
    const shouldRefresh = isReadyToRefresh.value && !refreshing;
    pullDownPosition.value = withTiming(
      shouldRefresh ? RESTING_OFFSET_WHEN_REFRESHING : 0,
      { duration: 180 }
    );

    if (shouldRefresh) {
      isReadyToRefresh.value = false;
      // Trigger refresh
      const doRefresh = async () => {
        try {
          setRefreshing(true);
          if (onRefresh) {
            await onRefresh();
          } else {
            // demo: fake fetch
            await new Promise((r) => setTimeout(r, 1500));
          }
        } finally {
          setRefreshing(false);
          pullDownPosition.value = withTiming(0, { duration: 180 });
        }
      };
      void doRefresh();
    }
  }, [onRefresh, pullDownPosition, isReadyToRefresh, refreshing]);

  const panResponderRef = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        scrollPosition.value <= 0 && gesture.dy >= 0,
      onPanResponderMove: (_evt, gesture) => {
        console.log("gesture", gesture.dy);
        const next = Math.max(0, Math.min(MAX_PULL, gesture.dy));
        pullDownPosition.value = next;

        // arm/disarm refresh threshold
        if (!isReadyToRefresh.value && next >= TRIGGER) {
          isReadyToRefresh.value = true;
          runOnJS(updateHintText)("Release to refresh");
        } else if (isReadyToRefresh.value && next < TRIGGER) {
          isReadyToRefresh.value = false;
          runOnJS(updateHintText)("Pull to refresh");
        }
      },
      onPanResponderRelease: onPanRelease,
      onPanResponderTerminate: onPanRelease,
    })
  );

  // Update hint text when refreshing state changes
  React.useEffect(() => {
    if (refreshing) {
      setHintText("Refreshing…");
    } else if (isReadyToRefresh.value) {
      setHintText("Release to refresh");
    } else {
      setHintText("Pull to refresh");
    }
  }, [refreshing]);

  // Pull translation
  const pullDownContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullDownPosition.value }],
  }));

  // Header container grows with pull
  const refreshHeaderStyle = useAnimatedStyle(() => ({
    height: pullDownPosition.value,
    opacity: Math.max(0, (pullDownPosition.value - 20) / 60),
  }));

  // Icon reacts to pull
  const refreshIconStyle = useAnimatedStyle(() => {
    const scale = Math.min(1, pullDownPosition.value / TRIGGER);
    const rotation = `${pullDownPosition.value * 3}deg`;
    return {
      transform: [{ scale }, { rotate: rotation }],
    };
  });

  return (
    <View style={styles.screen} {...props}>
      {/* Refresh header (animated area revealed by pull) */}
      <AnimatedView style={[styles.refreshHeader, refreshHeaderStyle]}>
        {refreshIcon ? (
          <Animated.Image
            source={refreshIcon}
            style={[styles.icon, refreshIconStyle]}
          />
        ) : (
          <Animated.View style={[styles.iconFallback, refreshIconStyle]} />
        )}
        <Animated.Text style={styles.hint}>{hintText}</Animated.Text>
      </AnimatedView>

      {/* Pullable container holding the list */}
      <AnimatedView
        style={[styles.listContainer, pullDownContainerStyle]}
        {...panResponderRef.current.panHandlers}
        pointerEvents={refreshing ? "none" : "auto"}
      >
        <AnimatedScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingVertical: 12 }}
        >
          <View>
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
          </View>
        </AnimatedScrollView>
      </AnimatedView>
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
