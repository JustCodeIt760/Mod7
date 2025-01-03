import { FeatureCard } from './';
import styles from './ProjectPage.module.css';

function SprintContent({ sprint, features }) {
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
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('featureId', feature.id);
          }}
        />
      ))}
    </div>
  );
}

export default SprintContent;
