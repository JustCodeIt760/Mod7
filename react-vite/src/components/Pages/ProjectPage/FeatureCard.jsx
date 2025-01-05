import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TaskList } from './';
import {
  FaPencilAlt,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
} from 'react-icons/fa';
import { thunkUpdateFeature } from '../../../redux/feature';
import EditableField from '../../utils/EditableField';
import styles from './styles/FeatureCard.module.css';

function FeatureCard({ feature, projectId, showTasks = false }) {
  const dispatch = useDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSaveName = async (newName) => {
    if (newName !== feature.name) {
      const featureData = {
        ...feature,
        name: newName,
        id: feature.id,
      };
      await dispatch(thunkUpdateFeature(projectId, featureData));
    }
  };

  const isEditing = isEditingName || isEditingTask;

  console.log('isEditingName:', isEditingName);
  console.log('isEditingTask:', isEditingTask);
  console.log('combined isEditing:', isEditing);
  console.log('draggable:', !isEditing);

  return (
    <div
      className={`${styles.featureCard} ${isEditing ? styles.editing : ''}`}
      draggable={!isEditing}
      onDragStart={(e) => {
        if (!isEditing) {
          e.dataTransfer.setData('featureId', feature.id);
        }
      }}
    >
      {showTasks ? (
        <>
          <div className={styles.featureHeader}>
            <div
              className={styles.featureTitle}
              onClick={() => {
                if (!isEditing) {
                  setIsExpanded(!isExpanded);
                }
              }}
            >
              <div className={styles.titleSection}>
                {isExpanded ? (
                  <FaChevronDown className={styles.chevron} />
                ) : (
                  <FaChevronRight className={styles.chevron} />
                )}
                <EditableField
                  value={feature.name}
                  onSave={handleSaveName}
                  isEditing={isEditingName}
                  setIsEditing={setIsEditingName}
                  className={styles.featureName}
                  containerClassName={styles.featureCard}
                  excludeClassNames={[
                    styles.editIcon,
                    styles.deleteIcon,
                    styles.featureControls,
                  ]}
                />
              </div>
              <div className={styles.featureControls}>
                <span className={styles.taskCount}>
                  {feature.tasks?.length || 0} Tasks
                </span>
                <FaPencilAlt
                  className={styles.editIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(!isEditingName);
                  }}
                />
                {isEditingName && (
                  <FaTimes
                    className={styles.deleteIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          {isExpanded && (
            <TaskList
              tasks={feature.tasks}
              projectId={projectId}
              featureId={feature.id}
              isEditing={isEditingTask}
              setIsEditing={setIsEditingTask}
            />
          )}
        </>
      ) : (
        <div className={styles.parkingLotFeature}>
          <div className={styles.featureNameDisplay}>
            <EditableField
              value={feature.name}
              onSave={handleSaveName}
              isEditing={isEditingName}
              setIsEditing={setIsEditingName}
              className={styles.featureName}
              containerClassName={styles.featureCard}
              excludeClassNames={[styles.editIcon]}
            />
            <FaPencilAlt
              className={styles.editIcon}
              onClick={() => setIsEditingName(!isEditingName)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FeatureCard;
