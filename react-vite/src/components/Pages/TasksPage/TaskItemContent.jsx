import styles from './TaskItem.module.css';
function TaskItemContent({
  task,
  onToggleCompletion,
  status = false,
  showAssignment = false,
}) {
  return (
    <>
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
          <h3
            className={`${styles.taskName} ${
              task.status === 'Completed' ? styles.completedText : ''
            }`}
          >
            {task.name}
          </h3>
        </div>
      </div>

      <p className={styles.description}>{task.description}</p>

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
            <span className={styles.label}>Due:</span>
            <span className={styles.value}>{task.display.dueDate}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.label}>Duration:</span>
            <span className={styles.value}>{task.duration}</span>
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
    </>
  );
}

export default TaskItemContent;
