import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView, 
} from "react-native";
import { useRouter } from "expo-router";
import type { Project } from "@/types";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SIDEBAR_WIDTH = 300;
const SIDEBAR_RADIUS = 24;

type SidebarProps = {
  projects: Project[];
  openProject: (project: Project) => void;
};

export function Sidebar({ projects, openProject }: SidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const startX = useSharedValue(0);

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
  };

  const panGesture = Gesture.Pan()

    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.min(
        0,
        Math.max(-SIDEBAR_WIDTH, startX.value + event.translationX)
      );
    })
    .onEnd(() => {
      if (translateX.value > -SIDEBAR_WIDTH / 2) {
        translateX.value = withTiming(0);
      } else {
        translateX.value = withTiming(-SIDEBAR_WIDTH);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
    
      <TouchableOpacity
        style={styles.menuButton}
        activeOpacity={0.7}
        onPress={() => {
          setOpen(true);
          translateX.value = withTiming(0);
        }}
      >
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sidebar, animatedStyle]}>
          <SafeAreaView style={styles.safeArea}>
            <Text style={styles.sidebarTitle}>History</Text>

            <FlatList
              data={projects}
              keyExtractor={(item) => item.id}
              style={styles.scrollableList}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.projectCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    openProject(item);
                    translateX.value = withTiming(-SIDEBAR_WIDTH);
                    setOpen(false);
                  }}
                >
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{item.name}</Text>
                  </View>

                
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.sandboxStatus}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No history found yet.</Text>
              }
            />
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 48,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },

  menuText: {
    fontSize: 22,
    color: "#374151",
  },

  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#F9FAFB",
    borderTopRightRadius: SIDEBAR_RADIUS,
    borderBottomRightRadius: SIDEBAR_RADIUS,
    overflow: "hidden", 
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 100,
  },

  safeArea: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  sidebarTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  scrollableList: {
    flex: 1, 
  },

  listContent: {
    paddingBottom: 40, 
  },

  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  projectInfo: {
    flex: 1,
    marginRight: 12,
  },

  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  statusBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  statusText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9CA3AF",
    fontSize: 15,
    fontStyle: "italic",
  },
});