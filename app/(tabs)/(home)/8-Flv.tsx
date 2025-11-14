import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { VLCPlayer } from "react-native-vlc-media-player";

const { width } = Dimensions.get("window");

const DEFAULT_VIDEO_URL =
  "https://pull-vtt-2.videocc.net/recordf/c052528317630282448603ee.flv";

const FLV = () => {
  const { videoUrl: videoUrlParam } = useLocalSearchParams<{
    videoUrl?: string;
  }>();
  const videoUrl = videoUrlParam || DEFAULT_VIDEO_URL;

  const vlcPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setError("Video URL not found.");
    }
  }, [videoUrl]);

  const handleError = (e: any) => {
    console.error("VLC Player Error:", e);
    setError("An error occurred while playing the video.");
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log("VLC Player loaded");
    setIsLoading(false);
    setError(null);
  };

  const handleBuffering = (e: any) => {
    console.log("VLC Buffering:", e.isBuffering);
    setIsLoading(e.isBuffering);
  };

  // Try to play after load
  useEffect(() => {
    if (vlcPlayerRef.current && !isLoading && !error) {
      // Give it a moment then try to play
      const timer = setTimeout(() => {
        try {
          vlcPlayerRef.current?.play?.();
        } catch (e) {
          console.log("Play error:", e);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error]);

  if (!videoUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid video URL.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <VLCPlayer
          ref={vlcPlayerRef}
          style={styles.video}
          source={{ uri: videoUrl }}
          autoplay={true}
          onError={handleError}
          onLoad={handleLoad}
          onBuffering={handleBuffering}
          // Additional options for FLV
          // VLC supports FLV, but some streams may require these options
          // Recommended options for HLS/FLV streams
          // You can add parameters like --network-caching=1000
          // but this library doesn't support them directly
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>Live Stream</Text>
    </View>
  );
};

export default FLV;

// Component that accepts videoUrl as prop (for programmatic use)
interface FLVProps {
  videoUrl: string;
}

export const FLVComponent: React.FC<FLVProps> = ({ videoUrl }) => {
  const vlcPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setError("Video URL not found.");
    }
  }, [videoUrl]);

  const handleError = (e: any) => {
    setError("An error occurred while playing the video.");
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleBuffering = (e: any) => {
    setIsLoading(e.isBuffering);
  };

  if (!videoUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid video URL.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <VLCPlayer
          ref={vlcPlayerRef}
          style={styles.video}
          source={{ uri: videoUrl }}
          autoplay={true}
          onError={handleError}
          onLoad={handleLoad}
          onBuffering={handleBuffering}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>Live Stream</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  playerContainer: {
    position: "relative",
    width: "100%",
    height: (width * 9) / 16, // 16:9 aspect ratio
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  stateText: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
