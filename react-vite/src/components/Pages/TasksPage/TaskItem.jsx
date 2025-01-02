import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkToggleTaskCompletion } from '../../../redux/task';
import styles from './TaskItem.module.css';

function TaskItem({ task }) {
  const dispatch = useDispatch();

  const handleToggleCompletion = async () => {
    console.log(task.id);
    await dispatch(thunkToggleTaskCompletion(task.id));
  };

  return (
    <div className={styles.taskItem}>
      <div className={styles.contextHeader}>
        <span className={styles.projectName}>
          {task.context?.project?.name || 'No Project'}
        </span>
        <span className={styles.separator}>•</span>
        <em className={styles.featureName}>
          {task.context?.feature?.name || 'No Feature'}
        </em>
      </div>

      <div className={styles.taskHeader}>
        <div className={styles.titleSection}>
          <button
            onClick={handleToggleCompletion}
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
          <h3
            className={`${styles.taskName} ${
              task.status === 'Completed' ? styles.completedText : ''
            }`}
          >
            {task.name}
          </h3>
        </div>
        <span
          className={`${styles.priority} ${
            styles[`priority${task.display.priority}`]
          }`}
        >
          {task.display.priority}
        </span>
      </div>

      <p className={styles.description}>{task.description}</p>

      <div className={styles.metadata}>
        <div className={styles.dates}>
          <div className={styles.dateItem}>
            <span className={styles.label}>Due:</span>
            <span className={styles.value}>{task.display.dueDate}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.label}>Duration:</span>
            <span className={styles.value}>{task.duration}</span>
          </div>
        </div>
        <span
          className={`${styles.status} ${
            styles[task.status.replace(/\s+/g, '')]
          }`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
}

export default TaskItem;
