import axios from "axios";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from "react-native-reanimated";
import Svg, {
  Defs,
  G,
  Line,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Chart configuration constants
const CHART_HEIGHT = 300; // Height of candlestick chart area
const VOLUME_HEIGHT = 100; // Height of volume chart area
const CHART_PADDING = 16;
const CANDLE_SPACING = 2; // Space between candles
const MIN_CANDLE_WIDTH = 2;
const MAX_CANDLE_WIDTH = 20;
const DEFAULT_CANDLE_WIDTH = 6;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const AUTO_FETCH_THRESHOLD = -50; // Negative value: when translateX is less than this (more negative), trigger fetch
const SCROLL_DIFF_THRESHOLD = 50; // Reduced from 100px - minimum scroll difference before triggering new fetch
const BASE_URL =
  "https://trading-system.tentstock.cc:4222/api/line/sh000001/5m";

interface StockDataPoint {
  ts: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  total_trade_amount: number;
  total_trade_volume: number;
  average_price: number;
}

interface ChartDimensions {
  width: number;
  chartHeight: number;
  volumeHeight: number;
  padding: number;
}

/**
 * Formats a date string to YYYY-MM-DD format for the API
 */
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parses a timestamp string and returns a Date object
 */
const parseTimestamp = (ts: string): Date => {
  return new Date(ts);
};

/**
 * Gets the date from the first data point (oldest)
 */
const getOldestDate = (data: StockDataPoint[]): Date | null => {
  if (data.length === 0) return null;
  return parseTimestamp(data[0].ts);
};

/**
 * Fetches stock data from the API
 */
const fetchStockData = async (fromDate: string): Promise<StockDataPoint[]> => {
  const url = `${BASE_URL}?from=${fromDate}`;
  const response = await axios.get<StockDataPoint[]>(url);
  return response.data;
};

const StockChart = () => {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Refs to prevent duplicate API calls (for JS thread)
  const lastFetchDateRef = useRef<string | null>(null);
  const fetchTriggeredRef = useRef(false);

  // Reanimated shared values for pan and zoom
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Shared values for tracking fetch state (accessible in worklets)
  const lastFetchScrollX = useSharedValue(-Infinity);
  const isFetchingShared = useSharedValue(false);

  // State to track scale for React re-renders (needed for SVG)
  // Only updated when zoom gesture ENDS, not during zoom
  const [scaleState, setScaleState] = useState(1);
  const previousScaleState = useRef(1); // Track previous scale to adjust translateX
  const isZooming = useSharedValue(false); // Track if currently zooming

  // Chart dimensions
  const chartWidth = SCREEN_WIDTH - CHART_PADDING * 2;
  const chartDimensions: ChartDimensions = useMemo(
    () => ({
      width: chartWidth,
      chartHeight: CHART_HEIGHT,
      volumeHeight: VOLUME_HEIGHT,
      padding: CHART_PADDING,
    }),
    [chartWidth]
  );

  /**
   * Fetch data for a specific date (oldest date to request)
   */
  const fetchDataForDate = useCallback(async (targetDate: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      const fromDate = formatDateForAPI(targetDate);
      const response = await fetchStockData(fromDate);
      //   console.log(`[StockChart] Fetched ${response.length} data points`);
      setData(response);
      lastFetchDateRef.current = fromDate;
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch stock data"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    const initialDate = dayjs().subtract(10, "day").toDate();

    fetchDataForDate(initialDate);
  }, [fetchDataForDate]);

  // Track if we've initialized the scroll position
  const hasInitializedScroll = useRef(false);
  // Track previous data length to detect when older data is added
  const previousDataLength = useRef(0);
  const pendingTranslateXAdjustment = useRef<number | null>(null);

  /**
   * Initialize scroll position to show latest data (rightmost) when data first loads
   */
  useEffect(() => {
    if (data.length > 0 && !isLoading && !hasInitializedScroll.current) {
      runOnUI(() => {
        "worklet";
        // Calculate total width with current scale
        const effectiveScale = clamp(scaleState, MIN_ZOOM, MAX_ZOOM);
        const currentCandleWidth =
          clamp(
            DEFAULT_CANDLE_WIDTH * effectiveScale,
            MIN_CANDLE_WIDTH,
            MAX_CANDLE_WIDTH
          ) + CANDLE_SPACING;
        const totalWidth = data.length * currentCandleWidth;

        // Set translateX to show rightmost (newest) data
        // translateX should be at minTranslateX (most negative) to show right side
        const minTranslateX =
          totalWidth > chartDimensions.width
            ? -(totalWidth - chartDimensions.width)
            : 0;

        translateX.value = minTranslateX;
      })();

      hasInitializedScroll.current = true;
      previousDataLength.current = data.length;
    } else if (
      data.length > previousDataLength.current &&
      hasInitializedScroll.current
    ) {
      // Data was prepended (older data added to the left)
      // Adjust translateX to maintain visual position
      if (pendingTranslateXAdjustment.current !== null) {
        runOnUI(() => {
          "worklet";
          translateX.value =
            translateX.value - (pendingTranslateXAdjustment.current || 0);
        })();
        pendingTranslateXAdjustment.current = null;
      }
      previousDataLength.current = data.length;
    }
  }, [data.length, isLoading, chartDimensions.width, scaleState, translateX]);

  /**
   * Adjust translateX when scaleState changes to maintain visual position
   */
  useEffect(() => {
    if (previousScaleState.current !== scaleState && data.length > 0) {
      const dataLen = data.length;
      const chartWidth = chartDimensions.width;
      const oldScale = previousScaleState.current;
      const newScale = scaleState;

      runOnUI(() => {
        "worklet";

        // Calculate old and new candle widths
        const oldCandleWidth =
          clamp(
            DEFAULT_CANDLE_WIDTH * oldScale,
            MIN_CANDLE_WIDTH,
            MAX_CANDLE_WIDTH
          ) + CANDLE_SPACING;
        const newCandleWidth =
          clamp(
            DEFAULT_CANDLE_WIDTH * newScale,
            MIN_CANDLE_WIDTH,
            MAX_CANDLE_WIDTH
          ) + CANDLE_SPACING;

        // Calculate old and new total widths
        const oldTotalWidth = dataLen * oldCandleWidth;
        const newTotalWidth = dataLen * newCandleWidth;

        // Find the center point in the viewport
        const viewportCenter = chartWidth / 2;

        // Calculate which position in content is at center of viewport
        const contentPosAtCenter = -translateX.value + viewportCenter;

        // This position as ratio of old total width
        const ratioAtCenter = contentPosAtCenter / oldTotalWidth;

        // Apply same ratio to new total width
        const newContentPosAtCenter = ratioAtCenter * newTotalWidth;

        // Calculate new translateX to keep that point at center
        let newTranslateX = -(newContentPosAtCenter - viewportCenter);

        // Clamp to boundaries
        const minTranslateX =
          newTotalWidth > chartWidth ? -(newTotalWidth - chartWidth) : 0;
        const maxTranslateX = 0;

        newTranslateX = clamp(newTranslateX, minTranslateX, maxTranslateX);

        // Update translateX
        translateX.value = newTranslateX;
      })();

      previousScaleState.current = scaleState;
    }
  }, [scaleState, data.length, translateX, chartDimensions.width]);

  /**
   * Calculates price range (min/max) for visible candles
   */
  const priceRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0 };

    let min = Infinity;
    let max = -Infinity;

    data.forEach((point) => {
      min = Math.min(min, point.low);
      max = Math.max(max, point.high);
    });

    // Add padding (5% on each side)
    const padding = (max - min) * 0.05;
    return {
      min: min - padding,
      max: max + padding,
    };
  }, [data]);

  /**
   * Calculates max volume for scaling volume bars
   */
  const maxVolume = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((point) => point.volume));
  }, [data]);

  /**
   * Fetches older data when user scrolls near the left edge
   * Changes the date parameter in the API to fetch data from the previous day
   */
  const fetchOlderData = useCallback(async () => {
    if (isFetching || data.length === 0) {
      fetchTriggeredRef.current = false;
      isFetchingShared.value = false;
      return;
    }

    const oldestDate = getOldestDate(data);
    if (!oldestDate) {
      fetchTriggeredRef.current = false;
      isFetchingShared.value = false;
      return;
    }

    // Go back one day from the oldest date to fetch older data
    const previousDate = new Date(oldestDate);
    previousDate.setDate(previousDate.getDate() - 1);
    const fromDate = formatDateForAPI(previousDate);

    // Prevent fetching the same date twice
    if (lastFetchDateRef.current === fromDate) {
      fetchTriggeredRef.current = false;
      isFetchingShared.value = false;
      return;
    }

    console.log(
      `[StockChart] Fetching older data for date: ${fromDate} (previous day from ${formatDateForAPI(
        oldestDate
      )})`
    );

    setIsFetching(true);
    setIsLoadingMore(true);
    isFetchingShared.value = true;
    lastFetchDateRef.current = fromDate;

    try {
      // API call with updated date parameter
      const olderData = await fetchStockData(fromDate);
      console.log(`[StockChart] Fetched ${olderData.length} older data points`);

      if (olderData.length > 0) {
        // Calculate width of new data being added
        const effectiveScale = clamp(scale.value, MIN_ZOOM, MAX_ZOOM);
        const currentCandleWidth =
          clamp(
            DEFAULT_CANDLE_WIDTH * effectiveScale,
            MIN_CANDLE_WIDTH,
            MAX_CANDLE_WIDTH
          ) + CANDLE_SPACING;
        const addedWidth = olderData.length * currentCandleWidth;

        // Store the adjustment amount - will be applied in useEffect after data updates
        pendingTranslateXAdjustment.current = addedWidth;

        // Prepend older data to existing data
        // The useEffect will adjust translateX after this state update
        setData((prev) => [...olderData, ...prev]);
      }
    } catch (err) {
      console.error("Error fetching older data:", err);
      lastFetchDateRef.current = null; // Reset on error to allow retry
    } finally {
      setIsFetching(false);
      setIsLoadingMore(false);
      fetchTriggeredRef.current = false;
      isFetchingShared.value = false;
    }
  }, [data, isFetching, isFetchingShared]);

  /**
   * Checks if we need to fetch older data based on scroll position
   * Uses debouncing and position tracking to prevent excessive API calls
   * Note: translateX is negative when scrolled left, so we check if it's less than threshold
   * When near the left endpoint, calls API with updated date parameter
   */
  const checkAndFetchOlderData = useCallback(
    (scrollX: number, minTranslateX?: number) => {
      "worklet";
      // scrollX is negative when scrolled left (to see older data)
      // Check if we're near the left edge (more negative than threshold) OR at the boundary
      const isNearLeftEdge = scrollX <= AUTO_FETCH_THRESHOLD;
      const isAtBoundary =
        minTranslateX !== undefined && Math.abs(scrollX - minTranslateX) < 5;

      if (isNearLeftEdge || isAtBoundary) {
        // Only trigger if:
        // 1. We've scrolled significantly from the last fetch position OR we're at the boundary
        // 2. We're not currently fetching
        const scrollDiff = Math.abs(scrollX - lastFetchScrollX.value);
        const shouldFetch =
          (scrollDiff >= SCROLL_DIFF_THRESHOLD || isAtBoundary) &&
          !isFetchingShared.value;

        if (shouldFetch) {
          lastFetchScrollX.value = scrollX;
          // Trigger API call with updated date - fetchOlderData will change the date parameter
          runOnJS(fetchOlderData)();
        }
      } else {
        // Reset tracking when user scrolls away from the threshold (back to right)
        if (scrollX > AUTO_FETCH_THRESHOLD + 100) {
          lastFetchScrollX.value = -Infinity;
        }
      }
    },
    [fetchOlderData, isFetchingShared, lastFetchScrollX]
  );

  /**
   * Update scale state ONLY when zoom gesture ends
   * During zoom, we don't re-render SVG to keep UI thread smooth
   * This dramatically reduces JS thread load during zoom gestures
   */
  const updateScaleState = useCallback((newScale: number) => {
    setScaleState(newScale);
  }, []);

  /**
   * Calculates chart dimensions and scales
   */
  const chartCalculations = useMemo(() => {
    if (data.length === 0) {
      return {
        visibleCandleCount: 0,
        totalWidth: 0,
        priceScale: 1,
        volumeScale: 1,
        candleWidth: DEFAULT_CANDLE_WIDTH + CANDLE_SPACING,
      };
    }

    // Use current scale state for calculations
    const effectiveScale = clamp(scaleState, MIN_ZOOM, MAX_ZOOM);
    const currentCandleWidth =
      clamp(
        DEFAULT_CANDLE_WIDTH * effectiveScale,
        MIN_CANDLE_WIDTH,
        MAX_CANDLE_WIDTH
      ) + CANDLE_SPACING;

    const visibleCandleCount = Math.floor(
      chartDimensions.width / currentCandleWidth
    );
    const totalWidth = data.length * currentCandleWidth;

    const priceRangeSize = priceRange.max - priceRange.min;
    const priceScale =
      priceRangeSize > 0 ? chartDimensions.chartHeight / priceRangeSize : 1;

    const volumeScale =
      maxVolume > 0 ? chartDimensions.volumeHeight / maxVolume : 1;

    return {
      visibleCandleCount,
      totalWidth,
      priceScale,
      volumeScale,
      candleWidth: currentCandleWidth,
    };
  }, [data, chartDimensions, priceRange, maxVolume, scaleState]);

  /**
   * Pan gesture for horizontal scrolling
   * Note: Boundaries are recalculated on each gesture update to account for zoom changes
   */
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-5, 5]) // Require 5px horizontal movement to activate (more sensitive)
        .failOffsetY([-20, 20]) // Fail if vertical movement exceeds 20px (allows some vertical movement)
        .onStart(() => {
          savedTranslateX.value = translateX.value;
        })
        .onUpdate((event) => {
          // Recalculate boundaries based on current scale
          const effectiveScale = clamp(scale.value, MIN_ZOOM, MAX_ZOOM);
          const currentCandleWidth =
            clamp(
              DEFAULT_CANDLE_WIDTH * effectiveScale,
              MIN_CANDLE_WIDTH,
              MAX_CANDLE_WIDTH
            ) + CANDLE_SPACING;
          const totalWidth = data.length * currentCandleWidth;

          // Calculate boundaries - allow scrolling left if content is wider than screen
          const minTranslateX =
            totalWidth > chartDimensions.width
              ? -(totalWidth - chartDimensions.width)
              : 0;
          const maxTranslateX = 0;

          const newTranslateX = savedTranslateX.value + event.translationX;
          translateX.value = clamp(newTranslateX, minTranslateX, maxTranslateX);

          // Check for fetching older data during scroll (with throttling via the check function)
          // Pass minTranslateX to detect when user reaches the left boundary
          checkAndFetchOlderData(translateX.value, minTranslateX);
        })
        .onEnd((event) => {
          // Recalculate boundaries for decay animation
          const effectiveScale = clamp(scale.value, MIN_ZOOM, MAX_ZOOM);
          const currentCandleWidth =
            clamp(
              DEFAULT_CANDLE_WIDTH * effectiveScale,
              MIN_CANDLE_WIDTH,
              MAX_CANDLE_WIDTH
            ) + CANDLE_SPACING;
          const totalWidth = data.length * currentCandleWidth;

          // Calculate boundaries - allow scrolling left if content is wider than screen
          const minTranslateX =
            totalWidth > chartDimensions.width
              ? -(totalWidth - chartDimensions.width)
              : 0;
          const maxTranslateX = 0;

          translateX.value = withDecay(
            {
              velocity: event.velocityX,
              clamp: [minTranslateX, maxTranslateX],
              deceleration: 0.998,
            },
            (finished) => {
              // Only check for fetching older data after gesture ends
              if (finished) {
                checkAndFetchOlderData(translateX.value, minTranslateX);
              }
            }
          );

          // Also check immediately when gesture ends (before decay finishes)
          checkAndFetchOlderData(translateX.value, minTranslateX);
        }),
    [data.length, chartDimensions.width, scale, checkAndFetchOlderData]
  );

  /**
   * Pinch gesture for zooming
   * All calculations happen on UI thread
   * Only triggers React re-render when gesture ENDS
   */
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onStart(() => {
          "worklet";
          savedScale.value = scale.value;
          isZooming.value = true; // Mark as zooming
        })
        .onUpdate((event) => {
          "worklet";
          // Update scale on UI thread - no JS thread work
          const newScale = savedScale.value * event.scale;
          scale.value = clamp(newScale, MIN_ZOOM, MAX_ZOOM);
        })
        .onEnd(() => {
          "worklet";
          const finalScale = clamp(scale.value, MIN_ZOOM, MAX_ZOOM);

          // Smooth spring animation to final scale
          scale.value = withSpring(
            finalScale,
            {
              damping: 15,
              stiffness: 150,
            },
            (finished) => {
              "worklet";
              if (finished) {
                isZooming.value = false;
                // NOW update React state to trigger SVG re-render
                runOnJS(updateScaleState)(finalScale);
              }
            }
          );
        }),
    [scale, updateScaleState]
  );

  /**
   * Combined gesture (pan + pinch)
   */
  const composedGesture = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture]
  );

  /**
   * Animated style for the chart container
   * During zoom, we apply scaleX transform for smooth feedback
   * After zoom ends, SVG re-renders at the new scale and transform is removed
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        // Apply scaleX only during zoom gesture for visual feedback
        // After zoom ends, this will be 1.0 and SVG renders at actual scale
        { scaleX: isZooming.value ? scale.value / scaleState : 1 },
      ],
    };
  });

  /**
   * Renders a single candlestick
   */
  const renderCandlestick = (
    point: StockDataPoint,
    index: number,
    candleWidth: number,
    priceScale: number
  ) => {
    const x = index * candleWidth + candleWidth / 2;
    const isUp = point.close >= point.open;

    // Calculate Y positions for price chart
    const highY =
      chartDimensions.chartHeight - (point.high - priceRange.min) * priceScale;
    const lowY =
      chartDimensions.chartHeight - (point.low - priceRange.min) * priceScale;
    const openY =
      chartDimensions.chartHeight - (point.open - priceRange.min) * priceScale;
    const closeY =
      chartDimensions.chartHeight - (point.close - priceRange.min) * priceScale;

    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

    const color = isUp ? "#4CAF50" : "#F44336";

    return (
      <G key={`candle-${index}`}>
        {/* Wick (shadow) */}
        <Line
          x1={x}
          y1={highY}
          x2={x}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />

        {/* Candlestick body */}
        <Rect
          x={x - candleWidth / 2 + CANDLE_SPACING / 2}
          y={bodyTop}
          width={candleWidth - CANDLE_SPACING}
          height={bodyHeight}
          fill={color}
        />
      </G>
    );
  };

  /**
   * Renders a single volume bar
   */
  const renderVolumeBar = (
    point: StockDataPoint,
    index: number,
    candleWidth: number,
    volumeScale: number
  ) => {
    const x = index * candleWidth + candleWidth / 2;
    const isUp = point.close >= point.open;
    const volumeBarHeight = point.volume * volumeScale;
    const volumeBarY = chartDimensions.volumeHeight - volumeBarHeight;

    return (
      <Rect
        key={`volume-${index}`}
        x={x - candleWidth / 2 + CANDLE_SPACING / 2}
        y={volumeBarY}
        width={candleWidth - CANDLE_SPACING}
        height={volumeBarHeight}
        fill={isUp ? "#4CAF5080" : "#F4433680"}
      />
    );
  };

  /**
   * Renders the chart SVG
   * Memoized to prevent unnecessary re-renders during pan gestures
   */
  const renderChart = useMemo(() => {
    if (data.length === 0) return null;

    const { candleWidth, priceScale, volumeScale, totalWidth } =
      chartCalculations;

    return (
      <Svg
        width={totalWidth}
        height={chartDimensions.chartHeight + chartDimensions.volumeHeight}
      >
        <Defs>
          <LinearGradient id="upGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#4CAF50" stopOpacity="1" />
            <Stop offset="100%" stopColor="#4CAF50" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="downGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F44336" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F44336" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Candlestick chart area */}
        <G y={0}>
          {data.map((point, index) =>
            renderCandlestick(point, index, candleWidth, priceScale)
          )}
        </G>

        {/* Divider between price and volume */}
        <Line
          x1={0}
          y1={chartDimensions.chartHeight}
          x2={chartDimensions.width}
          y2={chartDimensions.chartHeight}
          stroke="#BDBDBD"
          strokeWidth={1}
        />

        {/* Volume chart area */}
        <G y={chartDimensions.chartHeight}>
          {data.map((point, index) =>
            renderVolumeBar(point, index, candleWidth, volumeScale)
          )}
        </G>
      </Svg>
    );
  }, [data, chartCalculations, priceRange, chartDimensions]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Chart</Text>
      <Text style={styles.dataInfo}>
        Data points: {data.length} | Zoom: {scaleState.toFixed(2)}x
      </Text>

      <GestureDetector gesture={composedGesture}>
        <View style={styles.chartContainer}>
          <Animated.View style={[styles.chartContent, animatedStyle]}>
            {renderChart}
          </Animated.View>
        </View>
      </GestureDetector>

      {isLoadingMore && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#1976d2" />
          <Text style={styles.loadingMoreText}>Loading older data...</Text>
        </View>
      )}

      <Text style={styles.instructions}>
        Pan left/right to scroll • Pinch to zoom
      </Text>
    </View>
  );
};

export default StockChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CHART_PADDING,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  dataInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  chartContainer: {
    height: CHART_HEIGHT + VOLUME_HEIGHT,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chartContent: {
    height: CHART_HEIGHT + VOLUME_HEIGHT,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#666",
  },
  instructions: {
    marginTop: 16,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});
