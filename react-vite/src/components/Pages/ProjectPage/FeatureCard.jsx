import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TaskList } from './';
import {
  FaPencilAlt,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
  FaPlus,
} from 'react-icons/fa';
import { thunkUpdateFeature, thunkRemoveFeature } from '../../../redux/feature';
import { thunkAddTask } from '../../../redux/task';
import EditableField from '../../utils/EditableField';
import ConfirmationModal from '../../utils/ConfirmationModal';
import styles from './styles/FeatureCard.module.css';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';

function FeatureCard({
  feature,
  projectId,
  showTasks = false,
  normalizeTask,
  sourceType,
}) {
  const dispatch = useDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleQuickAddTask = async (e) => {
    e.stopPropagation();

    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const taskData = {
      name: 'New Task',
      description: 'Task description here',
      status: 'Not Started',
      priority: 0,
      start_date: startDate.toISOString(),
      due_date: dueDate.toISOString(),
      assigned_to: null,
    };

    try {
      await dispatch(thunkAddTask(projectId, feature.id, taskData));
      setIsExpanded(true);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDragStart = (e) => {
    if (!isEditing) {
      console.log('Drag start:', { featureId: feature.id, sourceType });
      e.dataTransfer.setData('featureId', feature.id.toString());
      e.dataTransfer.setData('sourceType', sourceType);
      setIsDragging(true);
      e.target.classList.add(styles.dragging);
    }
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    e.target.classList.remove(styles.dragging);
  };

  const isEditing = isEditingName || isEditingTask;

  return (
    <div
      className={`${styles.featureCard} ${isEditing ? styles.editing : ''} ${
        isDragging ? styles.dragging : ''
      }`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
                <FaPlus
                  className={styles.addTaskIcon}
                  onClick={handleQuickAddTask}
                  title="Quick Add Task"
                />
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
            <div className={styles.nameAndTasks}>
              <EditableField
                value={feature.name}
                onSave={handleSaveName}
                isEditing={isEditingName}
                setIsEditing={setIsEditingName}
                className={styles.featureName}
                containerClassName={styles.featureCard}
                excludeClassNames={[
                  styles.editIcon,
                  modalStyles.modalOverlay,
                  modalStyles.modal,
                  modalStyles.modalButtons,
                ]}
              />
              <span className={styles.taskCount}>
                {feature.tasks?.length || 0} Tasks
              </span>
            </div>
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
