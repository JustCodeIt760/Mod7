import styles from './TaskItem.module.css';

function TaskItemHeader({ project, feature }) {
  return (
    <div className={styles.contextHeader}>
      <span className={styles.projectName}>
        {project?.name || 'No Project'}
      </span>
      <span className={styles.separator}>•</span>
      <em className={styles.featureName}>{feature?.name || 'No Feature'}</em>
    </div>
  );
}

export default TaskItemHeader;
