// components/TaskBar.jsx
import { useMemo } from 'react';
import { parseISO, isSameDay } from 'date-fns';
import { useSelector } from 'react-redux';
import styles from '../styles/SprintTimeline.module.css';

const TaskBar = ({
  task,
  days,
  index,
  isUserTask,
  onSelect,
  onHover,
  users,
}) => {
  const feature = useSelector(
    (state) => state.features.allFeatures[task.feature_id]
  );

  const { style, extendsLeft, extendsRight } = useMemo(() => {
    const taskStart = parseISO(task.start_date);
    const taskEnd = parseISO(task.due_date);
    const sprintStart = parseISO(days[0].toISOString());
    const sprintEnd = parseISO(days[days.length - 1].toISOString());
    const totalDays = days.length;

    let startIndex = days.findIndex((day) => isSameDay(day, taskStart));
    let endIndex = days.findIndex((day) => isSameDay(day, taskEnd));

    // Check if task extends beyond sprint boundaries
    const doesExtendLeft = taskStart < sprintStart;
    const doesExtendRight = taskEnd > sprintEnd;

    // Clamp indices to sprint boundaries
    if (startIndex === -1 || doesExtendLeft) startIndex = 0;
    if (endIndex === -1 || doesExtendRight) endIndex = totalDays - 1;

    return {
      style: {
        left: `${(startIndex / totalDays) * 100}%`,
        width: `${((endIndex - startIndex + 1) / totalDays) * 100}%`,
        top: `${index * 44}px`,
      },
      extendsLeft: doesExtendLeft,
      extendsRight: doesExtendRight,
    };
  }, [task, days]);

  return (
    <div
      className={`${styles.taskBar} 
        ${isUserTask ? styles.userTask : ''} 
        ${extendsLeft ? styles.extendsLeft : ''} 
        ${extendsRight ? styles.extendsRight : ''}`}
      style={style}
      onClick={() => onSelect(task)}
      onMouseEnter={() => onHover(task)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={styles.taskContent}>
        <span className={styles.taskName}>{task.name}</span>
        {feature && <span className={styles.featureName}>{feature.name}</span>}
      </div>
    </div>
  );
};

export default TaskBar;
