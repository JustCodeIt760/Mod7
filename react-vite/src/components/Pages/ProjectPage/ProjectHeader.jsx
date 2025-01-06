import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt, FaTimes, FaCalendar } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleDateChange = async (date) => {
    const projectData = {
      ...project,
      due_date: date.toISOString(),
      id: project.id,
    };
    const result = await dispatch(thunkUpdateProject(projectData));
    if (result) {
      setShowDatePicker(false);
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
          {isEditing ? (
            <div className={styles.datePickerContainer}>
              <span
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={styles.dateDisplay}
              >
                Due: {new Date(project.due_date).toLocaleDateString()}
                <FaCalendar className={styles.calendarIcon} />
              </span>
              {showDatePicker && (
                <div className={styles.datePickerWrapper}>
                  <DatePicker
                    selected={new Date(project.due_date)}
                    onChange={handleDateChange}
                    inline
                    minDate={new Date()}
                  />
                </div>
              )}
            </div>
          ) : (
            <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
          )}
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
