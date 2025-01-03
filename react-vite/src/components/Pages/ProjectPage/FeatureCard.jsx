import { TaskList } from './';
import styles from './styles/FeatureCard.module.css';
function FeatureCard({ feature, projectId, showTasks = false }) {
  return (
    <div
      className={styles.featureCard}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('featureId', feature.id)}
    >
      {showTasks && <h3>{feature.name}</h3>}
      {!showTasks && (
        <div className={styles.parkingLotFeature}>{feature.name}</div>
      )}
      {showTasks && <TaskList tasks={feature.tasks} />}
    </div>
  );
}
export default FeatureCard;
