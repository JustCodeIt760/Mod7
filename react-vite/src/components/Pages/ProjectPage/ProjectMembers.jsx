import { useState } from 'react';
import { FaPencilAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import styles from './styles/ProjectMembers.module.css';

function ProjectMembers({ project }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const users = useSelector((state) => state.users.allUsers);
  const currentUser = useSelector((state) => state.session.user);
  const owner = users[project.owner_id];
  if (!owner) return null;
  const isOwner = currentUser?.id === project.owner_id;

  const members =
    project.members
      .map((id) => users[id])
      .filter((member) => member.id !== owner.id) || [];

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
              <button className={styles.removeMemberButton}>
                <FaTimes />
              </button>
            )}
          </div>
        ))}
        {isOwner && (
          <button className={styles.addMemberButton} title="Add Member">
            <FaPlus />
          </button>
        )}
      </div>
    </div>
  );
}

export default ProjectMembers;
