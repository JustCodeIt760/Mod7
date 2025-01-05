import { useState } from 'react';
import { SprintHeader, SprintContent } from './';
import styles from './styles/SprintSection.module.css';

function SprintSection({ sprints, projectId, normalizeTask }) {
  const [currentSprintIndex, setCurrentSprintIndex] = useState(0);
  const currentSprint = sprints[currentSprintIndex];

  if (!sprints || sprints.length === 0) {
    return (
      <section className={styles.sprintSection}>
        <SprintHeader sprint={null} onPrevious={() => {}} onNext={() => {}} />
        <div className={styles.emptyState}>No sprints available</div>
      </section>
    );
  }

  return (
    <section className={styles.sprintSection}>
      <SprintHeader
        sprint={currentSprint}
        onPrevious={() =>
          setCurrentSprintIndex((prev) => Math.max(0, prev - 1))
        }
        onNext={() =>
          setCurrentSprintIndex((prev) =>
            Math.min(sprints.length - 1, prev + 1)
          )
        }
      />
      <SprintContent
        sprint={currentSprint}
        features={currentSprint?.features || []}
        projectId={projectId}
        normalizeTask={normalizeTask}
      />
    </section>
  );
}

export default SprintSection;
