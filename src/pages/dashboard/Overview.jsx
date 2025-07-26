import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import CreateTaskModal from "../../components/CreateTaskModal";
import EditTaskModal from "../../components/EditTaskModal";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const getTasks = async () => {
    try {
      const res = await api.get("/tasks/get-task");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const handleTaskCreated = (newTask) => {
    // If the task has an assignedToId but no assignedTo object, we need to populate it
    // This happens because the create API returns only the task data without populated relations
    if (newTask.assignedToId && !newTask.assignedTo) {
      // Try to find user info from mock users (temporary solution)
      const mockUsers = [
        {
          id: "4ab3acf9-5acf-4ef3-a3e7-6aa2701a7411",
          name: "Admin User",
          email: "admin@example.com",
          role: "ADMIN",
        },
        {
          id: "4fa65b43-8069-4edb-b6b8-fa8b6aa5cc2f",
          name: "Test User",
          email: "testuser@example.com",
          role: "USER",
        },
      ];

      const assignedUser = mockUsers.find(
        (user) => user.id === newTask.assignedToId
      );
      if (assignedUser) {
        newTask.assignedTo = assignedUser;
        setTasks((prev) => [newTask, ...prev]);
      } else {
        // If we can't find the user info, refetch the tasks to get complete data
        getTasks();
      }
    } else {
      // Add the new task to the existing tasks list
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    // Update the task in the existing tasks list
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-base-200">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="btn btn-sm btn-error" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Assigned To</th>
              {user.role === "ADMIN" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="mt-2">
                        {user.role === "ADMIN" ? (
                          // Admin sees a short truncated version
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description.length > 50
                              ? `${task.description.substring(0, 50)}...`
                              : task.description}
                          </div>
                        ) : (
                          // Regular users see full description in a nice box
                          <div className="bg-base-100 p-3 rounded-lg border-l-4 border-primary max-w-md">
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {task.description}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        task.priority === "high"
                          ? "badge-error"
                          : task.priority === "medium"
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                    >
                      {task.priority === "high"
                        ? "🔴"
                        : task.priority === "medium"
                        ? "🟡"
                        : "🟢"}{" "}
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.dueDate ? (
                      <div className="text-sm">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">No due date</span>
                    )}
                  </td>
                  <td>
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                            <span className="text-xs">
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {task.assignedTo.role === "ADMIN" ? "👑" : "👤"}{" "}
                            {task.assignedTo.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.assignedTo.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                        Unassigned
                      </span>
                    )}
                  </td>
                  {user.role === "ADMIN" && (
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-warning btn-outline"
                          onClick={() => handleEditTask(task)}
                          title="Edit Task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            ></path>
                          </svg>
                        </button>
                        <button
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-400">
                  No tasks available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {user.role === "ADMIN" && (
        <div className="mt-6">
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create New Task
          </button>
        </div>
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskUpdated={handleTaskUpdated}
        task={selectedTask}
      />
    </div>
  );
};

export default Dashboard;
