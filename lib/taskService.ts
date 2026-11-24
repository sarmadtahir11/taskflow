
const API_URL = "/api/tasks";

// Common API function
async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
}

// Get all tasks
export async function getTasks() {
  return apiRequest(API_URL, {
    cache: "no-store",
  });
}

// Create a new task
export async function createTask(title: string, priority: string) {
  return apiRequest(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      priority,
    }),
  });
}

// Update task status
export async function updateTask(id: string, completed: boolean) {
  return apiRequest(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      completed,
    }),
  });
}

// Delete a task
export async function deleteTask(id: string) {
  return apiRequest(
    `${API_URL}?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}
