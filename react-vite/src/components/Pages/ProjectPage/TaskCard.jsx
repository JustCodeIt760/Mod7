import { useDispatch } from 'react-redux';
// we are utilizing the same task item content from our tasks list (to keep same look and ease of change)
import { TaskItemContent } from '../TasksPage';
import { thunkToggleTaskCompletion } from '../../../redux/task';
import styles from './styles/TaskCard.module.css';

function TaskCard({ task, isHovered, onHover }) {
  const dispatch = useDispatch();

  const handleToggleCompletion = async () => {
    await dispatch(thunkToggleTaskCompletion(task.id));
  };

  return (
    <div className={styles.taskItem}>
      <TaskItemContent
        task={task}
        onToggleCompletion={handleToggleCompletion}
        isHovered={isHovered}
        onHover={onHover}
        showAssignment={true}
      />
    </div>
  );
}

export default TaskCard;
