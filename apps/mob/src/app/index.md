import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useRouter } from "expo-router";
import { fetchProjects, createProject } from "@/api/projects";
import type { Project } from "@/types";

export default function ProjectListScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <View style={styles.container}>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          value={newProjectName}
          onChangeText={setNewProjectName}
          placeholder="New project name"
          placeholderTextColor="#9999a3"
        />
        <TouchableOpacity
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {isLoading ? (
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
      )}
    </View>
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
    marginBottom: 12,
    gap: 8
  },
  input: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#efefca",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#18181b"
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