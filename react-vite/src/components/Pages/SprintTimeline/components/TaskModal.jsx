// components/TaskModal.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { thunkUpdateTask } from '../../../../redux/task';
import { useEffect } from 'react';
import styles from '../styles/SprintTimeline.module.css';

const TaskModal = ({ task, onClose, projectId, users }) => {
  // Log initial props
  console.log('TaskModal Initial Props:', {
    task,
    projectId,
    usersCount: Object.keys(users).length,
  });

  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  const feature = useSelector(
    (state) => state.features.allFeatures[task.feature_id]
  );

  // Log feature data
  console.log('Feature Data:', feature);

  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description || '',
    status: task.status,
    start_date: task.start_date ? task.start_date.split('T')[0] : '',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    priority: task.priority || 0,
    assigned_to: task.assigned_to || '',
  });

  // Log initial form data
  console.log('Initial Form Data:', formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form Field Change:', { field: name, value });
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log('Updated Form Data:', newData);
      return newData;
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit Started - Form Data:', formData);

    try {
      // Log dates before processing
      console.log('Date Processing:', {
        rawStartDate: formData.start_date,
        rawEndDate: formData.due_date,
      });

      // Match the exact format from your successful task example
      const updatedData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        start_date: `${formData.start_date}T00:00:00`, // Matches "2025-01-02T00:00:00" format
        due_date: `${formData.due_date}T00:00:00`, // Matches "2025-01-06T00:00:00" format
        priority: parseInt(formData.priority),
        assigned_to: formData.assigned_to
          ? parseInt(formData.assigned_to)
          : null,
        feature_id: task.feature_id, // Make sure we're including feature_id
      };

      console.log('Processed Update Data:', updatedData);
      console.log('Original Task Data:', task);
      console.log('Request Parameters:', {
        projectId,
        featureId: task.feature_id,
        taskId: task.id,
        updatedData,
      });

      const result = await dispatch(
        thunkUpdateTask(projectId, task.feature_id, task.id, updatedData)
      );

      console.log('Update Result:', result);

      if (result && !result.errors) {
        // Check specifically for absence of errors
        console.log('Update successful, closing modal');
        setIsEditing(false);
        onClose();
      } else {
        console.log('Update returned error:', result);
        throw new Error(result.errors?.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update Error:', {
        error: err,
        message: err.message,
        stack: err.stack,
      });
      setError(err.message || 'Failed to update task');
    }
  };

  // Add validation check before render
  useEffect(() => {
    console.log('Validation Check:', {
      hasStartDate: !!formData.start_date,
      hasDueDate: !!formData.due_date,
      startDateValid:
        new Date(formData.start_date).toString() !== 'Invalid Date',
      dueDateValid: new Date(formData.due_date).toString() !== 'Invalid Date',
      datesInOrder:
        new Date(formData.start_date) <= new Date(formData.due_date),
    });
  }, [formData.start_date, formData.due_date]);

  // Log on each render
  console.log('Current Modal State:', {
    isEditing,
    error,
    formData,
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{isEditing ? 'Edit Task' : task.name}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Task Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            ) : (
              <p>{task.name}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Feature</label>
            <p>{feature?.name}</p>
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            {isEditing ? (
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            ) : (
              <p>{task.status}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Priority</label>
            {isEditing ? (
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            ) : (
              <p>
                {formData.priority === 0
                  ? 'Low'
                  : formData.priority === 1
                  ? 'Medium'
                  : 'High'}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Assigned To</label>
            {isEditing ? (
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {Object.values(users).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            ) : (
              <p>{users[task.assigned_to]?.username || 'Unassigned'}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Timeline</label>
            {isEditing ? (
              <div className={styles.dateInputs}>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
                <span>to</span>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <p>
                {format(new Date(task.start_date), 'MMM d, yyyy')} -
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            ) : (
              <p>{task.description || 'No description provided.'}</p>
            )}
          </div>

          <div className={styles.modalActions}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                Edit Task
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
