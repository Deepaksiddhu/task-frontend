import { useState, useEffect } from "react";
import api from "../lib/api";

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedToId: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Populate form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        assignedToId: task.assignedToId || "",
      });
    }
  }, [task]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await api.get("/users/list");
      console.log("Users API response:", res.data);

      // Handle the actual API response structure
      const usersData = res.data?.users || res.data?.data || res.data || [];
      setUsers(usersData);

      if (usersData.length === 0) {
        console.log("No users returned from API, using mock data");
        // Fallback to mock users if no users returned
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
        setUsers(mockUsers);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);

      // Temporary fallback: Create mock users for testing
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

      setUsers(mockUsers);
      console.log("Using mock users data due to API error");
    } finally {
      setFetchingUsers(false);
    }
  };
  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetchUsers();
    }
  }, [isOpen, users.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const taskData = {
        ...formData,
        assignedToId: formData.assignedToId || null,
      };

      const res = await api.put(`/tasks/${task.id}`, taskData);

      // Create updated task object with user info if assigned
      const updatedTask = { ...res.data };
      if (updatedTask.assignedToId && !updatedTask.assignedTo) {
        const assignedUser = users.find(
          (user) => user.id === updatedTask.assignedToId
        );
        if (assignedUser) {
          updatedTask.assignedTo = assignedUser;
        }
      }

      onTaskUpdated(updatedTask);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <span className="bg-warning/10 text-warning rounded-full p-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </span>
            Edit Task
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error shadow-md">
            <svg
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="form-control">
            <label className="label font-semibold">Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Task title..."
              className="input input-bordered input-warning focus:input-warning px-4 py-3"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label font-semibold">Description</label>
            <textarea
              name="description"
              placeholder="Add task details..."
              className="textarea textarea-bordered textarea-warning focus:textarea-warning min-h-[100px] px-4 py-3"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label font-semibold">Priority</label>
              <select
                name="priority"
                className="select select-bordered select-warning focus:select-warning px-4 py-3"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label font-semibold">Due Date</label>
              <input
                type="date"
                name="dueDate"
                className="input input-bordered input-warning focus:input-warning px-4 py-3"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Assigned To */}
          <div className="form-control">
            <label className="label font-semibold">Assign To</label>
            <select
              name="assignedToId"
              className="select select-bordered select-warning focus:select-warning px-4 py-3"
              value={formData.assignedToId}
              onChange={handleInputChange}
              disabled={fetchingUsers}
            >
              <option value="">
                {fetchingUsers
                  ? "🔄 Loading users..."
                  : "👤 Select user (optional)"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.role === "ADMIN" ? "👑" : "👤"} {user.name} (
                  {user.email})
                </option>
              ))}
            </select>
            {!fetchingUsers && users.length === 0 && (
              <label className="label">
                <span className="label-text-alt text-warning flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                  Note: User assignment not available. Tasks will be unassigned.
                </span>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action justify-end pt-4 border-t border-base-200">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Updating...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Update Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
