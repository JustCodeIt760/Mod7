// components/utils/AddMemberModal.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetAllUsers } from '../../redux/user';
import { thunkAddProjectMember } from '../../redux/project';
import styles from './styles/AddMemberModal.module.css';

const AddMemberModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState('');
  const allUsers = useSelector((state) => state.users.siteUsers);
  const currentProject = useSelector((state) => state.projects.singleProject);

  useEffect(() => {
    if (isOpen) {
      dispatch(thunkGetAllUsers());
    }
  }, [isOpen, dispatch]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUserId) {
      const success = await dispatch(
        thunkAddProjectMember(projectId, selectedUserId)
      );
      if (success) {
        setSelectedUserId('');
        onClose();
      }
    }
  };

  if (!isOpen) return null;
  if (!currentProject) return null;

  const availableUsers = Object.values(allUsers).filter(
    (user) => !currentProject.members.includes(user.id)
  );

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Add Project Member</h2>
        <form onSubmit={handleSubmit}>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">Select a user</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email})
              </option>
            ))}
          </select>
          <div className={styles.buttonContainer}>
            <button type="submit" disabled={!selectedUserId}>
              Add Member
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
