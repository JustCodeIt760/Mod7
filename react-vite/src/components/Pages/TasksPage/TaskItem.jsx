import styles from './TaskItem.module.css';
import { useDispatch } from 'react-redux';
import TaskItemContent from './TaskItemContent';
import TaskItemHeader from './TaskItemHeader';
import { thunkToggleTaskCompletion } from '../../../redux/task';

function TaskItem({ task, showContext = true }) {
  const dispatch = useDispatch();

  const handleToggleCompletion = async () => {
    console.log(task.id);
    await dispatch(thunkToggleTaskCompletion(task.id));
  };

  return (
    <div className={styles.taskItem}>
      {showContext && (
        <TaskItemHeader
          project={task.context?.project}
          feature={task.context?.feature}
        />
      )}
      <TaskItemContent
        task={task}
        onToggleCompletion={handleToggleCompletion}
      />
    </div>
  );
}

export default TaskItem;
