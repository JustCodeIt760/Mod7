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
import { thunkRemoveFeature } from '../../../redux/feature';
import ConfirmationModal from '../../utils/ConfirmationModal';
import styles from './styles/FeatureCard.module.css';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';

function FeatureCard({ feature, projectId, showTasks = false, normalizeTask }) {
  const dispatch = useDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteButton = async (e, featureId) => {
    e.stopPropagation();
    await dispatch(thunkRemoveFeature(featureId));
  };

  const isEditing = isEditingName || isEditingTask;

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
                  modalClasses={[
                    modalStyles.modalOverlay,
                    modalStyles.modal,
                    modalStyles.modalButtons,
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
                  <>
                    <FaTimes
                      className={styles.deleteIcon}
                      onClick={() => setShowDeleteModal(true)}
                    />
                    <ConfirmationModal
                      isOpen={showDeleteModal}
                      onClose={() => setShowDeleteModal(false)}
                      itemType="feature"
                      itemId={feature.id}
                      itemName={feature.name}
                      deleteFunction={(featureId) =>
                        thunkRemoveFeature(featureId, projectId)
                      }
                    />
                  </>
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
              normalizeTask={normalizeTask}
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
              modalClasses={[
                modalStyles.modalOverlay,
                modalStyles.modal,
                modalStyles.modalButtons,
              ]}
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
