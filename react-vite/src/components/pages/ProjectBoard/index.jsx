import styles from './ProjectBoard.module.css';

function ProjectBoard() {
  return (
    <div className={styles.projectBoardContainer}>
      <div className={styles.header}>
        <h1>Project Board</h1>
        <p>Project management view coming soon! 📋</p>
      </div>

      <div className={styles.placeholderLayout}>
        <div className={styles.parkingLot}>
          <h2>Parking Lot</h2>
          <div className={styles.placeholderCard}>
            Unassigned Features will appear here
          </div>
        </div>

        <div className={styles.sprintSection}>
          <h2>Sprint View</h2>
          <div className={styles.placeholderCard}>
            Sprint timeline and features will appear here
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectBoard;
