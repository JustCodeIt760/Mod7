import { format } from 'date-fns';
import { useState } from 'react';
import styles from './SprintTimeline.module.css';

const TEAM_MEMBERS = {
  '1': 'Demo User',
  '2': 'Sarah',
  '3': 'Mike'
};

const TaskModal = ({ task, onClose }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState({
    taskName: task.taskName,
    status: task.status,
    description: task.description || '',
    startDate: format(task.startDate, 'yyyy-MM-dd'),
    endDate: format(task.endDate, 'yyyy-MM-dd'),
    assignees: task.assignees
  });

  const getAssigneeName = (userId) => {
    return TEAM_MEMBERS[userId] || `User ${userId}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement update logic
    setIsEditing(false);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    onClose();
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