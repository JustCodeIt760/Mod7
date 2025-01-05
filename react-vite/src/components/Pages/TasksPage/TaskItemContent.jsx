import { useState } from 'react';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import EditableField from '../../utils/EditableField';
import styles from './TaskItemContent.module.css';
import {
  thunkUpdateTaskName,
  thunkUpdateTaskDescription,
} from '../../../redux/task';
import { useDispatch } from 'react-redux';

function TaskItemContent({
  task,
  projectId,
  featureId,
  onToggleCompletion,
  status = false,
  showAssignment = false,
  isEditing,
  setIsEditing,
}) {
  const dispatch = useDispatch();
  const handleSaveName = async (newName) => {
    const result = await dispatch(
      thunkUpdateTaskName(projectId, featureId, task.id, newName)
    );
    if (result) setIsEditing(false);
  };

  const handleSaveDescription = async (newDescription) => {
    const result = await dispatch(
      thunkUpdateTaskDescription(projectId, featureId, task.id, newDescription)
    );
    if (result) setIsEditing(false);
  };

  return (
    <div className={styles.taskContainer}>
      <div className={styles.taskHeader}>
        <div className={styles.titleSection}>
          <button
            onClick={onToggleCompletion}
            className={`${styles.checkButton} ${
              task.status === 'Completed' ? styles.completed : ''
            }`}
            aria-label={
              task.status === 'Completed'
                ? 'Mark as incomplete'
                : 'Mark as complete'
            }
          >
            {task.status === 'Completed' ? '✓' : ''}
          </button>
          <EditableField
            value={task.name}
            onSave={handleSaveName}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            className={`${styles.taskName} ${
              task.status === 'Completed' ? styles.completedText : ''
            }`}
            containerClassName={styles.taskContainer}
            excludeClassNames={[styles.editIcon, styles.deleteIcon]}
          />
        </div>
        <div className={styles.taskControls}>
          <FaPencilAlt
            className={styles.editIcon}
            onClick={() => setIsEditing(!isEditing)}
          />
          {isEditing && (
            <FaTimes
              className={styles.deleteIcon}
              onClick={() => {
                /* Handle delete */
              }}
            />
          )}
        </div>
      </div>

      <EditableField
        value={task.description}
        onSave={handleSaveDescription}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        className={styles.description}
        containerClassName={styles.taskContainer}
        excludeClassNames={[styles.editIcon, styles.deleteIcon]}
      />

      {showAssignment && task.display.assignedTo && (
        <div className={styles.assignmentInfo}>
          <span className={styles.assignedLabel}>Assigned to:</span>
          <span className={styles.assignedValue}>
            {task.display.assignedTo}
          </span>
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.dates}>
          <div className={styles.dateItem}>
            <span className={styles.label}>Start:</span>
            <span className={styles.value}>{task.display.startDate}</span>
            <span className={styles.label}>Due:</span>
            <span className={styles.value}>{task.display.dueDate}</span>
          </div>
          <div className={styles.dateItem}>
            {/* <span className={styles.label}>Duration:</span> */}
            {/* <span className={styles.value}>{task.duration}</span> */}
            <pre>{JSON.stringify(task, null, 2)}</pre>
          </div>
        </div>
        <span
          className={`${styles.priority} ${
            styles[`priority${task.display.priority}`]
          }`}
        >
          {task.display.priority}
        </span>
        {status && (
          <span
            className={`${styles.status} ${
              styles[task.status.replace(/\s+/g, '')]
            }`}
          >
            {task.status}
          </span>
        )}
      </div>
    </div>
  );
}

export default TaskItemContent;
