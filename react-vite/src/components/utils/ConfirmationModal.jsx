// src/components/utils/ConfirmationModal.jsx
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import styles from './styles/ConfirmationModal.module.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemName = '',
  deleteFunction,
}) => {
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const messages = {
    project: {
      title: 'Delete Project',
      message: `Are you sure you want to delete "${itemName}"? This will delete all associated tasks and features. This action cannot be undone.`,
    },
    task: {
      title: 'Delete Task',
      message: `Are you sure you want to delete "${itemName}"? This will delete all associated features. This action cannot be undone.`,
    },
    feature: {
      title: 'Delete Feature',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    },
    user: {
      title: 'Delete User',
      message: `Are you sure you want to delete this user account? All associated data will be permanently removed. This action cannot be undone.`,
    },
  };

  const { title, message } = messages[itemType] || {
    title: 'Confirm Deletion',
    message:
      'Are you sure you want to delete this item? This action cannot be undone.',
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    try {
      console.log('Attempting to delete:', { itemType, itemId }); // Debug log
      await dispatch(deleteFunction(itemId));
      console.log('Delete successful'); // Debug log
      onClose();
    } catch (error) {
      console.error(`Failed to delete ${itemType}:`, error);
    }
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtons}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
            }}
            className={`${styles.deleteButton} ${styles[itemType + 'Delete']}`}
          >
            Delete {itemType}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmationModal;
