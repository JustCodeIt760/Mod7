// SprintControls.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaPlus, FaPencilAlt, FaTimes } from 'react-icons/fa';
import { thunkRemoveSprint } from '../../../redux/sprint';
import ConfirmationModal from '../../utils/ConfirmationModal';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';
import styles from './styles/SprintControls.module.css';

function SprintControls({
  sprint,
  onAddSprint,
  isEditing,
  setIsEditing,
  onDeleteSuccess,
}) {
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setIsEditing(false);
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
        onClick={() => setIsEditing(!isEditing)}
        title="Edit Sprint"
        disabled={!sprint}
      >
        <FaPencilAlt />
      </button>
      {isEditing && sprint && (
        <>
          <button
            className={`${styles.controlButton} ${styles.deleteButton}`}
            onClick={() => setShowDeleteModal(true)}
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
                onDeleteSuccess?.(); // Then handle navigation
              }
              return result;
            }}
          />
        </>
      )}
    </div>
  );
}

export default SprintControls;
