import { useDispatch } from 'react-redux';
import { TaskItemContent } from '../TasksPage';
import { thunkToggleTaskCompletion } from '../../../redux/task';
import styles from './styles/TaskCard.module.css';

function TaskCard({
  task,
  projectId,
  featureId,
  isHovered,
  onHover,
  isEditing,
  setIsEditing,
}) {
  const dispatch = useDispatch();

  const handleToggleCompletion = async () => {
    await dispatch(thunkToggleTaskCompletion(task.id));
  };

  return (
    <div className={styles.taskItem}>
      <TaskItemContent
        task={task}
        projectId={projectId}
        featureId={featureId}
        onToggleCompletion={handleToggleCompletion}
        isHovered={isHovered}
        onHover={onHover}
        showAssignment={true}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </div>
  );
}

export default TaskCard;
