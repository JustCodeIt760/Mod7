import { TaskList } from './';
import styles from './ProjectPage.module.css';
function FeatureCard({ feature, projectId }) {
  return (
    <div
      className={styles.featureCard}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('featureId', feature.id)}
    >
      <h3>{feature.name}</h3>
      <TaskList tasks={feature.tasks} />
    </div>
  );
}
export default FeatureCard;
