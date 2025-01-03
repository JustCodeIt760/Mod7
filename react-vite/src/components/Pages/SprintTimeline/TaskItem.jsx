import { getAssignedMemberColors } from '../../../utils/colors';
import styles from './SprintTimeline.module.css';

const TaskItem = ({ task, onClick }) => {
  const { vibrant: borderColor } = task.assigned_to
    ? getAssignedMemberColors(task.assigned_to)
    : { vibrant: '#CCCCCC' };

  return (
    <div
      className={styles.taskItem}
      onClick={onClick}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className={styles.taskHeader}>
        <h4 className={styles.taskName}>{task.name}</h4>
        <span className={styles.taskStatus}>{task.status}</span>
      </div>
      <div className={styles.taskDates}>
        <span>{task.start_date} - {task.due_date}</span>
      </div>
    </div>
  );
};

export default TaskItem;