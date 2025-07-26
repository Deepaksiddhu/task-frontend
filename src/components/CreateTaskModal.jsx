import { useState, useEffect } from "react";
import api from "../lib/api";

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
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

      const res = await api.post("/tasks/create", taskData);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignedToId: "",
      });
      onTaskCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full p-2">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </span>
            Create New Task
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
              className="input input-bordered input-primary"
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
              className="textarea textarea-bordered textarea-primary min-h-[100px]"
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
                className="select select-bordered select-primary"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label font-semibold">Due Date</label>
              <input
                type="date"
                name="dueDate"
                className="input input-bordered input-primary"
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
              className="select select-bordered select-primary"
              value={formData.assignedToId}
              onChange={handleInputChange}
              disabled={fetchingUsers}
            >
              <option value="">
                {fetchingUsers
                  ? "Loading users..."
                  : "Select a user (optional)"}
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role === "ADMIN" ? "👑" : "👤"} {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="modal-action justify-end pt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
