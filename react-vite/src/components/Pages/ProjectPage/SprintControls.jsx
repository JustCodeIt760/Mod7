import { useState } from 'react';
import { FaPlus, FaPencilAlt, FaTimes } from 'react-icons/fa';
import styles from './styles/SprintControls.module.css';

function SprintControls({ sprint, onAddSprint }) {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className={styles.sprintControls}>
      <button
        className={styles.controlButton}
        onClick={onAddSprint}
        title="Add Sprint"
      >
        <FaPlus />
      </button>
      <button
        className={styles.controlButton}
        onClick={() => setIsEditMode(!isEditMode)}
        title="Edit Sprint"
        disabled={!sprint}
      >
        <FaPencilAlt />
      </button>
      {isEditMode && sprint && (
        <button
          className={`${styles.controlButton} ${styles.deleteButton}`}
          onClick={() => {
            /* handle delete */
          }}
          title="Delete Sprint"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}

export default SprintControls;
