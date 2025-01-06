import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "./Modal";
import { thunkAddTask, thunkLoadTasks } from "../redux/task";
import { selectFeaturesBySprintId } from "../redux/feature";
import styles from "./Modal.css";
import { thunkLoadProjectUsers } from "../redux/user";

function TaskFormModal({ projectId, sprintId }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const currentUser = useSelector((state) => state.session.user);
  const users = useSelector((state) => state.users.allUsers);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [priority, setPriority] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [featureId, setFeatureId] = useState("");
  const [assignedTo, setAssignedTo] = useState(currentUser.id); //default to current user
  const features = useSelector(selectFeaturesBySprintId(projectId, sprintId));
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Load users when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await dispatch(thunkLoadProjectUsers(projectId));
        if (!response) {
          console.error("Failed to load users");
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, [dispatch, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    const errors = {};
    if (!name.length) errors.name = "Task name is required";
    if (!description.length) errors.description = "Description is required";
    if (!startDate) errors.startDate = "Start date is required";
    if (!dueDate) errors.dueDate = "Due date is required";
    if (!assignedTo) errors, (assignedTo = "Assignee is required");

    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      errors.dueDate = "Due date must be after start date";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const taskData = {
      name,
      description,
      status,
      priority,
      start_date: startDate,
      due_date: dueDate,
      assigned_to: null,
      assigned_to: assignedTo,
    };

    try {
      const response = await dispatch(
        thunkAddTask(projectId, featureId, taskData)
      );

      if (response) {
        await dispatch(thunkLoadTasks(projectId, featureId));
        closeModal();
      }
    } catch (error) {
      console.error("Task creation error:", error);
      setValidationErrors({
        submit: error.message || "Failed to create task",
      });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {validationErrors.submit && hasSubmitted && (
          <div className={styles.errorMessage}>{validationErrors.submit}</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="name">Task Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter task name"
            required
          />
          {validationErrors.name && hasSubmitted && (
            <span className={styles.error}>{validationErrors.name}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            required
          />
          {validationErrors.description && hasSubmitted && (
            <span className={styles.error}>{validationErrors.description}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <select
            value={featureId} // value is the ID
            onChange={(e) => setFeatureId(parseInt(e.target.value, 10))}
          >
            <option value="">Select a feature</option>
            {features.map((feature) => (
              <option
                key={feature.id}
                value={feature.id} // value is the ID
              >
                {feature.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="assignedTo">Assign to</label>
          <select
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
            disabled={isLoadingUsers}
          >
            <option value="">Select Assignee</option>
            {isLoadingUsers ? (
              <option value="" disabled>
                Loading users...
              </option>
            ) : (
              Object.values(users || {}).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))
            )}
          </select>
          {validationErrors.assignedTo && hasSubmitted && (
            <span className={styles.error}>{validationErrors.assignedTo}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value, 10))}
            // or
            // onChange={(e) => setPriority(Number(e.target.value))}
          >
            <option value="0">Low</option>
            <option value="1">Medium</option>
            <option value="2">High</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate ? startDate.split("T")[0] : ""}
            onChange={(e) => setStartDate(e.target.value + "T00:00:00Z")}
            required
          />
          {validationErrors.startDate && hasSubmitted && (
            <span className={styles.error}>{validationErrors.startDate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate ? dueDate.split("T")[0] : ""}
            onChange={(e) => setDueDate(e.target.value + "T00:00:00Z")}
            required
          />
          {validationErrors.dueDate && hasSubmitted && (
            <span className={styles.error}>{validationErrors.dueDate}</span>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
          <button type="submit">Create Task</button>
        </div>
      </form>
    </div>
  );
}

export default TaskFormModal;
