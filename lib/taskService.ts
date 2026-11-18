
const API_URL = "/api/tasks";

// Get all tasks
export async function getTasks() {
  const response = await fetch(API_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  return response.json();
}

// Create a new task
export async function createTask(title: string, priority: string) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      priority,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add task");
  }

  return response.json();
}

// Update task status
export async function updateTask(id: string, completed: boolean) {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      completed,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
}

// Delete a task
export async function deleteTask(id: string) {
  const response = await fetch(
    `${API_URL}?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }

  return response.json();
}
