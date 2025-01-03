import { format } from 'date-fns';
import styles from './SprintTimeline.module.css';

const TEAM_MEMBERS = {
  '1': 'Demo User',
  '2': 'Sarah',
  '3': 'Mike'
};

const getAssigneeName = (userId) => {
  return TEAM_MEMBERS[userId] || `User ${userId}`;
};

const TaskHoverCard = ({ task }) => (
  <div className={styles.tooltip}>
    <div className={styles.tooltipHeader}>
      <span className={styles.tooltipTitle}>{task.taskName}</span>
      <span className={`${styles.tooltipStatus} ${styles[task.status.toLowerCase()]}`}>
        {task.status}
      </span>
    </div>
    <div className={styles.tooltipBody}>
      <div className={styles.tooltipRow}>
        <span>Feature:</span>
        <span>{task.featureName}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Dates:</span>
        <span>{format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Assigned:</span>
        <span>{task.assignees[0] ? getAssigneeName(task.assignees[0]) : 'Unassigned'}</span>
      </div>
      {task.description && (
        <div className={styles.tooltipDescription}>
          {task.description.length > 100
            ? `${task.description.slice(0, 100)}...`
            : task.description}
        </div>
      )}
    </div>
  </div>
);

export default TaskHoverCard;