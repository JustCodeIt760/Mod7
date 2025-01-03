import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllTasks } from '../../../redux/task';
import { assignTeamMemberColors, getAssignedMemberColors } from '../../../utils/colors';
import styles from './SprintTimeline.module.css';

const Legend = () => {
  const tasks = useSelector(selectAllTasks);

  useEffect(() => {
    // Assign colors when tasks change
    assignTeamMemberColors(Object.values(tasks));
  }, [tasks]);

  // Get unique assigned members from tasks with their names
  const assignedMembers = Object.values(tasks)
    .filter(task => task.assigned_to)
    .reduce((acc, task) => {
      if (!acc.has(task.assigned_to)) {
        acc.set(task.assigned_to, {
          id: task.assigned_to,
          name: task.assigned_to_user?.username || `User ${task.assigned_to}`,
          colors: getAssignedMemberColors(task.assigned_to)
        });
      }
      return acc;
    }, new Map());

  if (assignedMembers.size === 0) return null;

  return (
    <div className={styles.legend}>
      <h4 className={styles.legendTitle}>Team Members</h4>
      <div className={styles.legendItems}>
        {Array.from(assignedMembers.values()).map(member => (
          <div key={member.id} className={styles.legendItem}>
            <div
              className={styles.colorBox}
              style={{ backgroundColor: member.colors.vibrant }}
            />
            <span>{member.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;