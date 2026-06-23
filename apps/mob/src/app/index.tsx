import { useCallback, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useRouter } from "expo-router";
import { fetchProjects, createProject } from "@/api/projects";
import { LinearGradient } from "expo-linear-gradient";
import type { Project } from "@/types";
import { Sidebar } from "@/components/Sidebar";

const MIN_INPUT_HEIGHT = 64;
const MAX_INPUT_HEIGHT = 160;

export default function ProjectListScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const placeholderAnim = [
    "Create a todo",
    "create a backend",
    "build a portfolio",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setIndex((prev) => (prev + 1) % placeholderAnim.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function goToChat(projectId: string, projectName: string) {
    router.push({
      pathname: "/chat/[projectId]",
      params: { projectId, projectName }
    });
  }

  async function handleCreate() {
    const name = newProjectName.trim();
    if (!name || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const project = await createProject(name);
      setNewProjectName("");
      setInputHeight(MIN_INPUT_HEIGHT);
      goToChat(project.id, project.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  }

  function openProject(project: Project) {
    goToChat(project.id, project.name);
  }

  return (
    <LinearGradient
      colors={[
        "#ffffff",
        "#dbeafe",
        "#60a5fa",
        "#ec4899",
        "#ef4444",
        "#f97316"
      ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <Sidebar projects={projects} openProject={openProject} />

      <View style={styles.createRow}>
        <View style={[styles.inputWrapper, { height: inputHeight }]}>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            value={newProjectName}
            onChangeText={setNewProjectName}
            placeholder={`cheatable ${placeholderAnim[index]}`}
            placeholderTextColor="#9999a3"
            multiline
            textAlignVertical="top"
            onContentSizeChange={(e) => {
              const next = Math.min(
                MAX_INPUT_HEIGHT,
                Math.max(MIN_INPUT_HEIGHT, e.nativeEvent.contentSize.height + 24)
              );
              setInputHeight(next);
            }}
          />
          <TouchableOpacity
            style={[styles.inlineButton, isCreating && styles.inlineButtonDisabled]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.createButtonText}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={load}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.projectRow} onPress={() => openProject(item)}>
              <Text style={styles.projectName}>{item.name}</Text>
              <Text style={styles.projectStatus}>{item.sandboxStatus}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No projects yet. Create your first one above.</Text>
          }
        />
      )} */}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 16
  },
  createRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 340,
    marginBottom: 12,
    gap: 8
  },
  inputWrapper: {
    position: "relative",
    flex: 1,
  },
  input: {
    color: "#18181b",
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingRight: 56,
    paddingBottom: 16,
    fontSize: 16,
  },
  inlineButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#989898",
    borderRadius: 300,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  inlineButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  createButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  createButtonDisabled: {
    backgroundColor: "#a3bffa"
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14
  },
  loader: {
    marginTop: 40
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  projectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea"
  },
  projectName: {
    fontSize: 16,
    color: "#18181b",
    fontWeight: "500"
  },
  projectStatus: {
    fontSize: 13,
    color: "#71717a"
  },
  error: {
    color: "#dc2626",
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 13
  },
  emptyText: {
    textAlign: "center",
    color: "#9999a3",
    marginTop: 40,
    fontSize: 14
  }
});