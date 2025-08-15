import { useRouter } from "expo-router";
import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

// Types
interface TimelineEvent {
  time: string;
  year: string;
  title: string;
  description: string;
}

interface TimelineConfig {
  padding: number;
  sectionSpacing: number;
  spacerWidth: number;
  itemSpacing: number;
  lineWidth: number;
  lineColor: string;
  dotSize: number;
  dotColor: string;
  timeContainerWidth: number;
  timeContainerHeight: number;
}

// Constants
const TIMELINE_CONFIG: TimelineConfig = {
  padding: 20,
  sectionSpacing: 30,
  spacerWidth: 40,
  itemSpacing: 30,
  lineWidth: 1,
  lineColor: "blue",
  dotSize: 11,
  dotColor: "#007bff",
  timeContainerWidth: 50,
  timeContainerHeight: 20,
};

const futureEvents: TimelineEvent[] = [
  {
    time: "09:30",
    year: "2025",
    title: "Pre-disclosure of interim report",
    description:
      "The 2025 Interim Report will be released on August 23, 2025 at 9:30 AM.",
  },
];

const historyEvents: TimelineEvent[] = [
  {
    time: "14:15",
    year: "2025",
    title: "Board meeting",
    description: `Quarterly board meeting to discuss Q3 results and outlook.
Topics included: operating margin, FX headwinds, cost optimization, hiring plan,
and guidance methodology for FY2026. Action items were assigned to finance and
product leads, with a follow-up checkpoint scheduled for next month.`,
  },
  {
    time: "16:45",
    year: "2025",
    title: "Earnings call",
    description: `Q3 earnings conference call with investors. Management reviewed revenue
growth, cohort retention, and segment performance across Enterprise, SMB, and
International. The Q&A covered pricing experiments, marketplace take rate,
and long-term operating model assumptions. Replays and a transcript will be
posted on the IR site within 24 hours.`,
  },
  {
    time: "10:00",
    year: "2025",
    title: "Press release",
    description: `We announced Q3 financial results, highlighting record GAAP revenue,
improved free cash flow, and continued investment in R&D. The release
also included an update on sustainability initiatives, including our move to
renewable energy credits and a supplier code of conduct rollout.`,
  },
  {
    time: "09:30",
    year: "2025",
    title: "Market open",
    description: `Stock market opens for trading. Early volume spiked following the pre-market
filing and guidance update; volatility expected through the first hour.`,
  },
  {
    time: "11:00",
    year: "2025",
    title: "Analyst briefing",
    description: `Briefing with financial analysts covering product roadmap, competitive
landscape, and go-to-market motion. We demoed the upcoming workflow
automation features and discussed expansion into two adjacent verticals.`,
  },
  {
    time: "12:30",
    year: "2025",
    title: "Customer roundtable",
    description: `Invite-only session with top customers sharing implementation best practices`,
  },
  {
    time: "13:10",
    year: "2025",
    title: "Security update",
    description: `Routine platform security bulletin release.
- Patches applied to core services
- No customer action required
- Next scheduled penetration test: October 2025
A detailed changelog is available in the trust center.`,
  },
  {
    time: "15:20",
    year: "2025",
    title: "Product launch recap",
    description: `A comprehensive recap of last week's launch:
We saw a 38% uplift in trials within 72 hours, strong social engagement, and
positive early feedback on performance improvements. Known issues include
edge cases with legacy configs, which will be addressed in patch 1.0.3.`,
  },
  {
    time: "17:30",
    year: "2025",
    title: "Internal AMA",
    description: `Company-wide AMA with leadership. Topics ranged from hybrid work policies to
compensation bands and L&D budget. Recording and summary will be shared in the
#all-hands channel tomorrow.`,
  },
];

// Components
const TimelineDot: React.FC<{
  left: number;
  top: number;
  size: number;
  color: string;
}> = memo(({ left, top, size, color }) => {
  const centerSize = size * 0.55;
  const outerSize = size;

  return (
    <Svg
      width={outerSize}
      height={outerSize}
      style={[
        styles.eventDot,
        {
          left: left - outerSize / 2,
          top: top - outerSize / 2,
        },
      ]}
    >
      <Circle
        cx={outerSize / 2}
        cy={outerSize / 2}
        r={outerSize / 2}
        fill={color}
        opacity={0.3}
      />
      <Circle
        cx={outerSize / 2}
        cy={outerSize / 2}
        r={centerSize / 2}
        fill={color}
        opacity={1}
      />
    </Svg>
  );
});

const VerticalDottedLine: React.FC<{
  left: number;
  width: number;
  color: string;
  height: number | string;
  top: number;
}> = memo(({ left, width, color, height, top }) => (
  <Svg
    height={height}
    width={width}
    style={{
      position: "absolute",
      left: left - width / 2,
      top,
      zIndex: 0,
    }}
  >
    <Line
      x1="1"
      y1="0"
      x2="1"
      y2={height}
      stroke={color}
      strokeWidth={width}
      strokeDasharray="2,2"
    />
  </Svg>
));

const TimelineSection: React.FC<{
  title: string;
  events: TimelineEvent[];
  config: TimelineConfig;
}> = ({ title, events, config }) => {
  const router = useRouter();
  const timeContainerRef = useRef<View>(null);
  const sectionRef = useRef<View>(null);
  const [sectionHeight, setSectionHeight] = useState(0);
  const [lastEventHeight, setLastEventHeight] = useState(0);
  const [timeContainerWidth, setTimeContainerWidth] = useState(0);
  const [timeContainerHeight, setTimeContainerHeight] = useState(0);

  // Memoize expensive calculations
  const dotLeftPosition = useMemo(
    () => timeContainerWidth + config.spacerWidth / 2,
    [timeContainerWidth, config.spacerWidth]
  );

  const dotTopPosition = useMemo(
    () => timeContainerHeight / 2,
    [timeContainerHeight]
  );

  const lineHeight = useMemo(
    () =>
      events.length > 1
        ? sectionHeight - lastEventHeight + timeContainerHeight / 2
        : "100%",
    [events.length, sectionHeight, lastEventHeight, timeContainerHeight]
  );

  // Memoize event handlers
  const handleEventPress = useCallback(() => {
    router.push("/(7-Timeline)/7-TimelineDetail");
  }, [router]);

  const handleEventLayout = useCallback(
    (index: number, height: number) => {
      if (index === events.length - 1) {
        setLastEventHeight(height);
      }
    },
    [events.length]
  );

  const handleSectionLayout = useCallback((height: number) => {
    setSectionHeight(height);
  }, []);

  const handleTimeContainerLayout = useCallback(
    (x: number, y: number, width: number, height: number) => {
      setTimeContainerWidth(width);
      setTimeContainerHeight(height);
    },
    []
  );

  useLayoutEffect(() => {
    if (timeContainerRef.current) {
      timeContainerRef.current.measureInWindow(handleTimeContainerLayout);
    }
  }, [handleTimeContainerLayout]);

  // Memoize styles that depend on config
  const eventContainerStyle = useMemo(
    () => [styles.eventContainer, { paddingBottom: config.itemSpacing }],
    [config.itemSpacing]
  );

  const timeContainerStyle = useMemo(
    () => [styles.timeContainer, { width: config.timeContainerWidth }],
    [config.timeContainerWidth]
  );

  const eventTitleStyle = useMemo(
    () => [
      styles.eventTitle,
      {
        height: timeContainerHeight,
        lineHeight: timeContainerHeight,
      },
    ],
    [timeContainerHeight]
  );

  return (
    <View
      style={styles.section}
      ref={sectionRef}
      onLayout={(e) => handleSectionLayout(e.nativeEvent.layout.height)}
    >
      <VerticalDottedLine
        left={dotLeftPosition}
        width={config.lineWidth}
        color={config.lineColor}
        height={lineHeight}
        top={0}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.timelineContainer}>
        {events.map((event, index) => (
          <View
            key={index}
            style={eventContainerStyle}
            onLayout={(e) =>
              handleEventLayout(index, e.nativeEvent.layout.height)
            }
          >
            <TimelineDot
              top={dotTopPosition}
              left={dotLeftPosition}
              size={config.dotSize}
              color={config.dotColor}
            />

            <View style={styles.eventContent}>
              <View ref={timeContainerRef} style={timeContainerStyle}>
                <Text style={styles.timeText}>{event.time}</Text>
                <Text style={styles.yearText}>{event.year}</Text>
              </View>

              <View style={{ width: config.spacerWidth }} />

              <TouchableOpacity onPress={handleEventPress} style={{ flex: 1 }}>
                <View style={styles.eventDetailContainer}>
                  <Text style={eventTitleStyle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Memoize the main component to prevent unnecessary re-renders
const TimelineComponent: React.FC = memo(() => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TimelineSection
          title="Future"
          events={futureEvents}
          config={TIMELINE_CONFIG}
        />
        <TimelineSection
          title="History"
          events={historyEvents}
          config={TIMELINE_CONFIG}
        />
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  section: {},
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    alignSelf: "flex-start",
  },
  timelineContainer: {
    position: "relative",
  },
  eventContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    minHeight: 40,
    paddingRight: 10,
  },
  eventDot: {
    position: "absolute",
    zIndex: 1,
  },
  eventContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#495057",
  },
  yearText: {
    fontSize: 12,
    fontWeight: "500",
  },
  eventDetailContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: "#6c757d",
  },
});

export default TimelineComponent;
