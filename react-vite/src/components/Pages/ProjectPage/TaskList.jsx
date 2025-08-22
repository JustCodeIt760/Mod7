import { useState } from 'react';
import { TaskCard } from './';
import styles from './styles/TaskList.module.css';

function TaskList({
  tasks,
  projectId,
  featureId,
  isEditing,
  setIsEditing,
  normalizeTask,
}) {
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          projectId={projectId}
          featureId={featureId}
          isHovered={hoveredTaskId === task.id}
          onHover={setHoveredTaskId}
          isEditing={editingTaskId === task.id} // Change this
          setIsEditing={(editing) => setEditingTaskId(editing ? task.id : null)} // Change this
          normalizeTask={normalizeTask}
        />
      ))}
    </div>
  );
}
export default TaskList;
