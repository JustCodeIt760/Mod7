import styles from './ProjectPage.module.css';

function ProjectHeader({ project }) {
  if (!project)
    return (
      <header className={styles.projectHeader}>
        <h1>Loading...</h1>
      </header>
    );

  return (
    <header className={styles.projectHeader}>
      <h1>{project.name}</h1>
      <div className={styles.projectMeta}>
        <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
      </div>
    </header>
  );
}

export default ProjectHeader;
