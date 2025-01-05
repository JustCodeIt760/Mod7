// components/Sprints/SprintHeader.js
import SprintControls from './SprintControls';
import styles from './styles/SprintHeader.module.css';

function SprintHeader({ sprint, onPrevious, onNext, onAddSprint }) {
  return (
    <div className={styles.sprintHeader}>
      <div className={styles.sprintNavigation}>
        <button
          className={styles.carouselButton}
          onClick={onPrevious}
          disabled={!sprint}
        >
          ←
        </button>

        <div className={styles.sprintInfo}>
          <h2 className={styles.sprintName}>{sprint?.name || 'No Sprints'}</h2>
          {sprint && (
            <span className={styles.sprintDates}>{sprint.display.dates}</span>
          )}
        </div>

        <button
          className={styles.carouselButton}
          onClick={onNext}
          disabled={!sprint}
        >
          →
        </button>
      </div>

      <SprintControls sprint={sprint} onAddSprint={onAddSprint} />
    </div>
  );
}

export default SprintHeader;
