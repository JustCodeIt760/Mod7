// components/TaskHoverCard.jsx
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import styles from '../styles/SprintTimeline.module.css';

const TaskHoverCard = ({ task, mousePosition, users }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current || !mousePosition) return;

    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();
    const { x, y } = mousePosition;

    // Position card relative to cursor
    let left = x + 10; // 10px offset from cursor
    let top = y - cardRect.height / 2; // Center vertically with cursor

    // Prevent card from going off screen
    if (left + cardRect.width > window.innerWidth) {
      left = x - cardRect.width - 10;
    }
    if (top + cardRect.height > window.innerHeight) {
      top = window.innerHeight - cardRect.height - 10;
    }
    if (top < 10) top = 10;

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }, [mousePosition]);

  if (!task) return null;

  const assignedUser = task.assigned_to ? users[task.assigned_to] : null;

  return (
    <div ref={cardRef} className={styles.hoverCard}>
      <h4 className={styles.hoverCardTitle}>{task.name}</h4>
      <div className={styles.hoverCardContent}>
        <div className={styles.hoverCardSection}>
          <span className={styles.label}>Status:</span>
          <span
            className={`${styles.status} ${
              styles[task.status.toLowerCase().replace(' ', '-')]
            }`}
          >
            {task.status}
          </span>
        </div>

        <div className={styles.hoverCardSection}>
          <span className={styles.label}>Assigned to:</span>
          <span className={styles.value}>
            {assignedUser ? assignedUser.username : 'Unassigned'}
          </span>
        </div>

        <div className={styles.hoverCardSection}>
          <span className={styles.label}>Timeline:</span>
          <span className={styles.value}>
            {format(new Date(task.start_date), 'MMM d')} -{' '}
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        </div>

        {task.priority !== undefined && (
          <div className={styles.hoverCardSection}>
            <span className={styles.label}>Priority:</span>
            <span
              className={`${styles.priority} ${
                styles[`priority-${task.priority}`]
              }`}
            >
              {task.priority === 0
                ? 'Low'
                : task.priority === 1
                ? 'Medium'
                : 'High'}
            </span>
          </div>
        )}

        {task.description && (
          <div className={styles.hoverCardSection}>
            <span className={styles.label}>Description:</span>
            <p className={styles.description}>{task.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskHoverCard;
