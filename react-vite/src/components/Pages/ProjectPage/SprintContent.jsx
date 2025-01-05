import { FeatureCard } from './';
import styles from './styles/SprintContent.module.css';

function SprintContent({ sprint, features, projectId }) {
  if (!sprint || !features.length) {
    return (
      <div className={styles.emptySprintContent}>
        <p>No features in this sprint</p>
      </div>
    );
  }

  return (
    <div className={styles.sprintContent}>
      {features.map((feature) => (
        <FeatureCard
          key={feature.id}
          feature={feature}
          projectId={projectId}
          showTasks={true}
        />
      ))}
    </div>
  );
}

export default SprintContent;
