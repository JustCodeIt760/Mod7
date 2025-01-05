// components/Sprints/SprintHeader.js
import { useSelector } from 'react-redux';
import SprintControls from './SprintControls';
import { selectAllSprints } from '../../../redux/sprint';
import styles from './styles/SprintHeader.module.css';

function SprintHeader({ sprint, onPrevious, onNext, onAddSprint }) {
  const allSprints = useSelector(selectAllSprints);

  const handleDeleteSuccess = () => {
    // Get remaining sprints (filter out the one being deleted)
    const remainingSprints = allSprints.filter((s) => s.id !== sprint.id);

    if (remainingSprints.length > 0) {
      const currentIndex = allSprints.findIndex((s) => s.id === sprint.id);

      if (currentIndex === 0) {
        // If we're deleting the first sprint, always go to the next one
        onNext();
      } else {
        // For any other position, go to the previous sprint
        onPrevious();
      }
    }
  };

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

      <SprintControls
        sprint={sprint}
        onAddSprint={onAddSprint}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default SprintHeader;
