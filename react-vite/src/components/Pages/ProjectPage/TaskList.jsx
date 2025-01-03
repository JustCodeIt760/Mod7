import { useState } from 'react';
import { TaskCard } from './';
import styles from './ProjectPage.module.css';

function TaskList({ tasks }) {
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isHovered={hoveredTaskId === task.id}
          onHover={setHoveredTaskId}
        />
      ))}
    </div>
  );
}
export default TaskList;
