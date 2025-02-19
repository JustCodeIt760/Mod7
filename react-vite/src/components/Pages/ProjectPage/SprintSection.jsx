import { useState } from 'react';
import { useDispatch } from 'react-redux'; // Add this import correctly
import { useEffect } from 'react';
import { SprintHeader, SprintContent } from './';
import { thunkAddSprint } from '../../../redux/sprint';
import styles from './styles/SprintSection.module.css';

function SprintSection({ sprints, projectId, normalizeTask }) {
  const dispatch = useDispatch();
  const [currentSprintIndex, setCurrentSprintIndex] = useState(0);

  const currentSprint = sprints[currentSprintIndex];

  useEffect(() => {
    if (currentSprintIndex >= sprints.length) {
      setCurrentSprintIndex(Math.max(0, sprints.length - 1));
    }
  }, [sprints, currentSprintIndex]);

  const handleAddSprint = async () => {
    const currentDate = new Date();

    // Create start date at beginning of day (00:00:00)
    const startDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );

    // Create end date at end of day (23:59:59.999) 7 days later
    const endDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate() + 7,
        23,
        59,
        59,
        999
      )
    );

    const sprintData = {
      name: 'New Sprint',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    const result = await dispatch(thunkAddSprint(projectId, sprintData));
    if (result) {
      const newSprintIndex = sprints.findIndex(
        (sprint) => new Date(sprint.start_date) >= new Date(result.start_date)
      );
      setCurrentSprintIndex(
        newSprintIndex === -1 ? sprints.length : newSprintIndex
      );
    }
  };

  if (!sprints || sprints.length === 0) {
    return (
      <section className={styles.sprintSection}>
        <SprintHeader
          sprint={null}
          onPrevious={() => {}}
          onNext={() => {}}
          onAddSprint={handleAddSprint}
        />
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
        onAddSprint={handleAddSprint}
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
