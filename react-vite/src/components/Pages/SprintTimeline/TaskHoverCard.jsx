import { useRef, useEffect } from 'react';
import useMousePosition from '../../../hooks/useMousePosition';
import { getAssignedMemberColors } from '../../../utils/colors';
import styles from './SprintTimeline.module.css';

const TaskHoverCard = ({ task }) => {
  const cardRef = useRef(null);
  const { x, y } = useMousePosition();

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position card to the right of cursor by default
    let left = x + 20; // 20px offset from cursor
    let top = y;

    // Check if card would go off right edge of screen
    if (left + cardRect.width > viewportWidth) {
      left = x - cardRect.width - 20; // Position to left of cursor instead
    }

    // Check if card would go off bottom of screen
    if (top + cardRect.height > viewportHeight) {
      top = viewportHeight - cardRect.height - 10; // 10px padding from bottom
    }

    // Check if card would go off top of screen
    if (top < 10) {
      top = 10; // 10px padding from top
    }

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }, [x, y]);

  const { vibrant: borderColor } = task.assigned_to
    ? getAssignedMemberColors(task.assigned_to)
    : { vibrant: '#CCCCCC' };

  return (
    <div
      ref={cardRef}
      className={styles.taskHoverCard}
      style={{
        position: 'fixed',
        zIndex: 1000,
        borderLeft: `4px solid ${borderColor}`
      }}
    >
      <h4 className={styles.taskTitle}>{task.name}</h4>
      <div className={styles.taskDetails}>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        {task.assigned_to_user && (
          <p><strong>Assigned to:</strong> {task.assigned_to_user.username}</p>
        )}
        <p><strong>Start:</strong> {task.start_date}</p>
        <p><strong>Due:</strong> {task.due_date}</p>
      </div>
      {task.description && (
        <div className={styles.taskDescription}>
          <strong>Description:</strong>
          <p>{task.description}</p>
        </div>
      )}
    </div>
  );
};

export default TaskHoverCard;