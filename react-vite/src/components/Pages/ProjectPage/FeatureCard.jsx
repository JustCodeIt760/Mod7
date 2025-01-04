import { useState } from 'react'; // Removed unused imports
import { useDispatch } from 'react-redux';
import { TaskList } from './';
import { FaPencilAlt } from 'react-icons/fa';
import { thunkUpdateFeature } from '../../../redux/feature';
import styles from './styles/FeatureCard.module.css';

function FeatureCard({ feature, projectId, showTasks = false }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(feature.name);

  const handleEdit = (e) => {
    setName(e.target.innerText);
  };

  const handleBlur = async (e) => {
    const newName = e.target.innerText;
    if (newName !== feature.name) {
      const featureData = {
        ...feature,
        name: newName,
        id: feature.id,
      };
      await dispatch(thunkUpdateFeature(projectId, featureData));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevents adding a new line
      e.target.blur(); // This will trigger the handleBlur
    }
  };

  return (
    <div
      className={styles.featureCard}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('featureId', feature.id)}
    >
      {showTasks && <h3>{feature.name}</h3>}
      {!showTasks && (
        <div className={styles.parkingLotFeature}>
          <div className={styles.featureNameDisplay}>
            <span
              contentEditable={isEditing}
              onInput={handleEdit}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              suppressContentEditableWarning={true}
            >
              {feature.name}
            </span>
            <FaPencilAlt
              className={styles.editIcon}
              onClick={() => setIsEditing(true)}
            />
          </div>
        </div>
      )}
      {showTasks && <TaskList tasks={feature.tasks} />}
    </div>
  );
}

export default FeatureCard;
