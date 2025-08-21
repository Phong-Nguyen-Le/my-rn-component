import * as React from "react";
import {
  ActivityIndicator,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = ViewProps & {
  children?: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
};

const MAX_PULL = 200;
const TRIGGER = 30; // pull distance to arm refresh
const RESTING_OFFSET_WHEN_REFRESHING = 40;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function PullToRefreshView({
  children,
  onRefresh,
  refreshing = false,
  ...props
}: Props) {
  // Shared values
  const pullDownPosition = useSharedValue(0);
  const scrollPosition = useSharedValue(0);
  const isReadyToRefresh = useSharedValue(false);

  // UI state
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
      if (onRefresh) {
        onRefresh();
      }
    }
  }, [onRefresh, pullDownPosition, isReadyToRefresh, refreshing]);

  const panResponderRef = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        scrollPosition.value <= 0 && gesture.dy >= 0,
      onPanResponderMove: (_evt, gesture) => {
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
      // Reset pull position when refreshing starts
      pullDownPosition.value = withTiming(RESTING_OFFSET_WHEN_REFRESHING, {
        duration: 180,
      });
    } else {
      // Reset pull position when refreshing ends
      pullDownPosition.value = withTiming(0, { duration: 180 });
      if (isReadyToRefresh.value) {
        setHintText("Release to refresh");
      } else {
        setHintText("Pull to refresh");
      }
    }
  }, [refreshing, pullDownPosition, isReadyToRefresh]);

  // Pull translation
  const pullDownContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullDownPosition.value }],
  }));

  // Header container grows with pull
  const refreshHeaderStyle = useAnimatedStyle(() => ({
    height: pullDownPosition.value,
    opacity: Math.max(0, pullDownPosition.value / 20),
  }));

  const arrowStyle = useAnimatedStyle(() => {
    const rotation = pullDownPosition.value >= TRIGGER ? 180 : 0;
    const opacity = interpolate(
      pullDownPosition.value,
      [0, 20],
      [0, 1],
      "clamp"
    );
    return {
      transform: [{ rotate: withTiming(`${rotation}deg`, { duration: 200 }) }],
      opacity,
    };
  });

  return (
    <View style={styles.screen} {...props}>
      <AnimatedView style={[styles.refreshHeader, refreshHeaderStyle]}>
        <View style={styles.hintContainer}>
          {refreshing ? (
            <ActivityIndicator size={8} color="#495057" />
          ) : (
            <Animated.View style={[styles.arrowIcon, arrowStyle]}>
              <Text style={styles.arrowText}>↓</Text>
            </Animated.View>
          )}
          <View>
            <Animated.Text style={styles.hint}>{hintText}</Animated.Text>
          </View>
        </View>
      </AnimatedView>

      {/* Pullable container holding the content */}
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
          {children}
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
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 16,
    color: "#495057",
    fontWeight: "bold",
  },
  hint: { color: "#6c757d", fontSize: 12 },
  listContainer: { flex: 1 },
});
