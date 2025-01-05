import { FaPencilAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import styles from './styles/ProjectHeader.module.css';

function ProjectHeader({ project }) {
  const currentUser = useSelector((state) => state.session.user);
  const isOwner = currentUser?.id === project?.owner_id;

  if (!project)
    return (
      <header className={styles.projectHeader}>
        <h1>Loading...</h1>
      </header>
    );

  return (
    <header className={styles.projectHeader}>
      <div className={styles.projectContent}>
        <h1>{project.name}</h1>
        <div className={styles.projectMeta}>
          <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
        </div>
        {isOwner && <FaPencilAlt className={styles.editIcon} />}
      </div>
    </header>
  );
}

export default ProjectHeader;
