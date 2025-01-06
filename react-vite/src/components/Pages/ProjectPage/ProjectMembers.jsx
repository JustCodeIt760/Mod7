import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPencilAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { thunkRemoveProjectMember } from '../../../redux/project';
import ConfirmationModal from '../../utils/ConfirmationModal';
import AddMemberModal from '../../utils/AddMemberModal';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';
import styles from './styles/ProjectMembers.module.css';

function ProjectMembers({ project }) {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const users = useSelector((state) => state.users.allUsers);
  const currentUser = useSelector((state) => state.session.user);
  const owner = users[project.owner_id];
  if (!owner) return null;

  const isOwner = currentUser?.id === project.owner_id;

  const members = (project?.members || [])
    .map((id) => users[id])
    .filter((member) => member && member.id !== owner.id);

  const handleRemoveMember = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setSelectedMember(null);
  };

  return (
    <div className={styles.membersSection}>
      <div className={styles.membersSectionHeader}>
        <h2>Project Members</h2>
        {isOwner && (
          <FaPencilAlt
            className={styles.editIcon}
            onClick={() => setIsEditMode(!isEditMode)}
          />
        )}
      </div>
      <div className={styles.membersList}>
        <div className={styles.memberItem}>
          <span className={styles.memberName}>{owner.full_name}</span>
          <span className={styles.ownerBadge}>Owner</span>
        </div>
        {members.map((member) => (
          <div key={member.id} className={styles.memberItem}>
            <span className={styles.memberName}>{member.full_name}</span>
            {isEditMode && isOwner && (
              <button
                className={styles.removeMemberButton}
                onClick={() => handleRemoveMember(member)}
              >
                <FaTimes />
              </button>
            )}
          </div>
        ))}
        {isOwner && (
          <>
            <button
              className={styles.addMemberButton}
              onClick={() => setShowAddModal(true)}
              title="Add Member"
            >
              <FaPlus />
            </button>
            <AddMemberModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              projectId={project.id}
            />
          </>
        )}
      </div>

      {selectedMember && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseModal}
          itemType="member"
          itemId={selectedMember.id}
          itemName={selectedMember.full_name}
          deleteFunction={(userId) =>
            thunkRemoveProjectMember(project.id, userId)
          }
          modalClasses={[
            modalStyles.modalOverlay,
            modalStyles.modal,
            modalStyles.modalButtons,
          ]}
        />
      )}
    </div>
  );
}

export default ProjectMembers;
