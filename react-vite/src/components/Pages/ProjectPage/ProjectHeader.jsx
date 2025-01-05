import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import EditableField from '../../utils/EditableField';
import ConfirmationModal from '../../utils/ConfirmationModal';
import { thunkUpdateProject, thunkRemoveProject } from '../../../redux/project';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';
import styles from './styles/ProjectHeader.module.css';

function ProjectHeader({ project }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const currentUser = useSelector((state) => state.session.user);
  const isOwner = currentUser?.id === project?.owner_id;

  const handleSaveName = async (newName) => {
    if (newName !== project.name) {
      const projectData = {
        ...project,
        name: newName,
        id: project.id,
      };
      const result = await dispatch(thunkUpdateProject(projectData));
      if (result) setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setIsEditing(false);
  };

  const handleDeleteProject = async (projectId) => {
    const result = await dispatch(thunkRemoveProject(projectId));
    if (result) {
      navigate('/');
    }
    return result;
  };

  if (!project)
    return (
      <header className={styles.projectHeader}>
        <h1>Loading...</h1>
      </header>
    );

  return (
    <header className={styles.projectHeader}>
      <div className={styles.projectContent}>
        <div
          className={`${styles.titleSection} ${
            isEditing ? styles.editing : ''
          }`}
        >
          <EditableField
            value={project.name}
            onSave={handleSaveName}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            className={styles.projectName}
            containerClassName={styles.projectHeader}
            excludeClassNames={[styles.editIcon, styles.deleteIcon]}
            modalClasses={[
              modalStyles.modalOverlay,
              modalStyles.modal,
              modalStyles.modalButtons,
            ]}
          />
          {isOwner && (
            <div className={styles.projectControls}>
              <FaPencilAlt
                className={styles.editIcon}
                onClick={() => setIsEditing(!isEditing)}
              />
              {isEditing && (
                <FaTimes
                  className={styles.deleteIcon}
                  onClick={() => setShowDeleteModal(true)}
                />
              )}
            </div>
          )}
        </div>
        <div className={styles.projectMeta}>
          <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        itemType="project"
        itemId={project.id}
        itemName={project.name}
        deleteFunction={handleDeleteProject}
        modalClasses={[
          modalStyles.modalOverlay,
          modalStyles.modal,
          modalStyles.modalButtons,
        ]}
      />
    </header>
  );
}

export default ProjectHeader;
