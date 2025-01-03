import { format } from 'date-fns';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { thunkUpdateTaskPosition, thunkRemoveTask } from '../../../redux/task';
import styles from './SprintTimeline.module.css';

const TEAM_MEMBERS = {
  '1': 'Demo User',
  '2': 'Sarah',
  '3': 'Mike'
};

const TaskModal = ({ task, onClose }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const featureId = task.feature_id;
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState({
    taskName: task.taskName,
    status: task.status,
    description: task.description || '',
    startDate: format(task.startDate, 'yyyy-MM-dd'),
    endDate: format(task.endDate, 'yyyy-MM-dd'),
    assignees: task.assignees
  });
  const [error, setError] = useState(null);

  const getAssigneeName = (userId) => {
    return TEAM_MEMBERS[userId] || `User ${userId}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous errors when user makes changes
    setError(null);
  };

  const validateForm = () => {
    if (!projectId) {
      setError('Project ID is missing. Please refresh the page.');
      return false;
    }
    if (!featureId) {
      setError('Feature ID is missing. Please refresh the page.');
      return false;
    }
    if (!task.id) {
      setError('Task ID is missing. Please refresh the page.');
      return false;
    }
    if (!formData.taskName.trim()) {
      setError('Task name is required.');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date must be before end date.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!validateForm()) return;

    try {
      console.log('Updating task:', {
        projectId,
        featureId,
        taskId: task.id,
        updates: {
          name: formData.taskName,
          status: formData.status,
          description: formData.description,
          start_date: formData.startDate,
          due_date: formData.endDate,
          assigned_to: formData.assignees[0] || null
        }
      });

      const updates = {
        name: formData.taskName,
        status: formData.status,
        description: formData.description,
        start_date: formData.startDate,
        due_date: formData.endDate,
        assigned_to: formData.assignees[0] || null
      };

      const result = await dispatch(thunkUpdateTaskPosition(
        projectId,
        featureId,
        task.id,
        updates
      ));

      console.log('Update result:', result);

      if (result) {
        setIsEditing(false);
        onClose();
      } else {
        throw new Error('Failed to update task. Server returned no data.');
      }
    } catch (err) {
      console.error('Task update error:', {
        error: err,
        taskData: {
          projectId,
          featureId,
          taskId: task.id
        }
      });

      // More specific error messages based on error type
      if (err.status === 405) {
        setError('Invalid API endpoint. Please check feature ID and task ID.');
      } else if (err.status === 403) {
        setError('You do not have permission to update this task.');
      } else if (err.status === 400) {
        setError(err.message || 'Invalid task data. Please check your inputs.');
      } else {
        setError(err.message || 'An unexpected error occurred while updating the task.');
      }
    }
  };

  const handleDelete = async () => {
    if (!projectId || !featureId || !task.id) {
      setError('Missing required IDs. Please refresh the page.');
      return;
    }

    try {
      const result = await dispatch(thunkRemoveTask(projectId, featureId, task.id));
      if (result) {
        onClose();
      } else {
        setError('Failed to delete task. Please try again.');
      }
    } catch (err) {
      console.error('Task deletion error:', err);
      if (err.status === 405) {
        setError('Invalid API endpoint. Please check feature ID and task ID.');
      } else if (err.status === 403) {
        setError('You do not have permission to delete this task.');
      } else if (err.status === 404) {
        setError('Task not found. It may have been already deleted.');
      } else {
        setError('An unexpected error occurred while deleting the task.');
      }
    }
  };

  return (
    <div className={styles.taskModal}>
      <div className={styles.modalHeader}>
        <h3>{isEditing ? 'Edit Task' : task.taskName}</h3>
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      </div>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Task Name</div>
          {isEditing ? (
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              className={styles.modalInput}
              autoFocus
            />
          ) : (
            <div>{task.taskName}</div>
          )}
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Feature</div>
          <div>{task.featureName}</div>
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Status</div>
          {isEditing ? (
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.modalSelect}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          ) : (
            <div>{task.status}</div>
          )}
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Assignee</div>
          {isEditing ? (
            <select
              name="assignees"
              value={formData.assignees[0] || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  assignees: e.target.value ? [e.target.value] : []
                }));
              }}
              className={styles.modalSelect}
            >
              <option value="">Unassigned</option>
              {Object.entries(TEAM_MEMBERS).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          ) : (
            <div>
              {task.assignees.map(id => getAssigneeName(id)).join(', ') || 'Unassigned'}
            </div>
          )}
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Timeline</div>
          {isEditing ? (
            <div className={styles.dateInputs}>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={styles.modalInput}
              />
              <span>to</span>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={styles.modalInput}
              />
            </div>
          ) : (
            <div>{format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}</div>
          )}
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Description</div>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.modalTextarea}
              rows={4}
            />
          ) : (
            <div>{task.description}</div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={handleDelete}
            className={`${styles.modalButton} ${styles.deleteButton}`}
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={styles.modalButton}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button
              type="submit"
              className={`${styles.modalButton} ${styles.updateButton}`}
            >
              Update
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskModal;