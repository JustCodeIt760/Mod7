import React from 'react';
import styles from './TaskItem.module.css';

function TaskItem({ task }) {
  if (task.name === 'Content Planning') {
    console.log('Content Planning Task:', {
      taskId: task.id,
      featureId: task.feature_id,
      taskData: task,
      context: task.context,
      projectInfo: task.context?.project,
      featureInfo: task.context?.feature,
    });
  }

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
        <h3 className={styles.taskName}>{task.name}</h3>
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
