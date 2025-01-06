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
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const sprintData = {
      name: 'New Sprint',
      start_date: startDate,
      end_date: endDate,
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
