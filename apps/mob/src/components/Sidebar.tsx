import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import type { Project } from "@/types";
import { fetchProjects, createProject } from "@/api/projects";
import {Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated , {useAnimatedStyle , useSharedValue, withTiming} from "react-native-reanimated";


const SIDEBAR_WIDTH = 280;



type SidebarProps = {
  projects: Project[];
  openProject: (project: Project) => void;
};

export function Sidebar({
  projects,
  openProject,
}: SidebarProps) {
     const router = useRouter();
    const [open , setOpen] = useState(false);
    const translateX = useSharedValue(-SIDEBAR_WIDTH);
    const startX =  useSharedValue(0);
    const toggleSidebar = () => {
        setOpen(prev => !prev)
    }

    const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.min(
        0, 
        Math.max(
          -SIDEBAR_WIDTH,
          startX.value + event.translationX
        )
      );
    })
    .onEnd(() => {
      if(translateX.value > -SIDEBAR_WIDTH / 2) { 
        translateX.value = withTiming(0);
      } else {
        translateX.value = withTiming(-SIDEBAR_WIDTH)
      }
    })

    const animaatedStyle = useAnimatedStyle(() => ({
      transform : [{translateX : translateX.value}]
    }))


return (
    <View style={styles.container}>
     
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => {
          setOpen(true)
          translateX.value = withTiming(0);
        }}
      >
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>
      
        <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sidebar , animaatedStyle]}>
          <Text style={styles.sidebarTitle}>History</Text>

          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.projectRow}
                onPress={() => {
                  openProject(item);
                  translateX.value = withTiming(-SIDEBAR_WIDTH);
                  setOpen(false); 
                }}
              >
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.projectStatus}>
                  {item.sandboxStatus}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No history found</Text>
            }
          />
        </Animated.View>
        </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  menuButton: {
    padding: 16,
  },

  menuText: {
    fontSize: 24,
  },

  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
    elevation: 8,
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },

  projectRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  projectName: {
    fontSize: 16,
    fontWeight: "600",
  },

  projectStatus: {
    color: "gray",
    marginTop: 4,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});