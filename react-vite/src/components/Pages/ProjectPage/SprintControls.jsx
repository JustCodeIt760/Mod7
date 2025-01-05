// SprintControls.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaPlus, FaPencilAlt, FaTimes } from 'react-icons/fa';
import { thunkRemoveSprint } from '../../../redux/sprint';
import ConfirmationModal from '../../utils/ConfirmationModal';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';
import styles from './styles/SprintControls.module.css';

function SprintControls({ sprint, onAddSprint, onDeleteSuccess }) {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (showDeleteModal) {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setIsEditMode(false); // Also reset edit mode
  };

  return (
    <div className={styles.sprintControls}>
      <button
        className={styles.controlButton}
        onClick={onAddSprint}
        title="Add Sprint"
      >
        <FaPlus />
      </button>
      <button
        className={styles.controlButton}
        onClick={handleEditToggle}
        title="Edit Sprint"
        disabled={!sprint}
      >
        <FaPencilAlt />
      </button>
      {isEditMode && sprint && (
        <>
          <button
            className={`${styles.controlButton} ${styles.deleteButton}`}
            onClick={handleDeleteClick}
            title="Delete Sprint"
          >
            <FaTimes />
          </button>
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={handleCloseModal}
            itemType="sprint"
            itemId={sprint.id}
            itemName={sprint.name}
            deleteFunction={async (sprintId) => {
              const result = await dispatch(
                thunkRemoveSprint(sprintId, sprint.project_id)
              );
              if (result) {
                handleCloseModal(); // Close modal first
                onDeleteSuccess?.(); // Then navigate
              }
              return result;
            }}
            modalClasses={[
              modalStyles.modalOverlay,
              modalStyles.modal,
              modalStyles.modalButtons,
            ]}
          />
        </>
      )}
    </div>
  );
}

export default SprintControls;
