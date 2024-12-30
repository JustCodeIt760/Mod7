import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './Workspace.module.css';

function Workspace() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.session.user);
  const projects = useSelector(state => state.projects?.allProjects || {});

  // Filter projects based on ownership
  const ownedProjects = Object.values(projects).filter(project => project.owner_id === user?.id);
  const sharedProjects = Object.values(projects).filter(project => project.owner_id !== user?.id);

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.header}>
        <h1>WorkSpace</h1>
        <button className={styles.createButton} onClick={() => navigate('/projects/new')}>
          Create a Project
        </button>
      </div>

      <div className={styles.projectsSection}>
        <h2 className={styles.sectionHeader}>Owned Projects</h2>
        <div className={styles.projectsGrid}>
          {ownedProjects.map(project => (
            <div key={project.id} className={styles.projectCard}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className={styles.projectStats}>
                <div>
                  <span>Current Sprint: {project.current_sprint?.name}</span>
                </div>
                <div className={styles.taskStats}>
                  <span>Total Tasks: {project.total_tasks}</span>
                  <span className={styles.overdue}>Overdue: {project.overdue_tasks}</span>
                </div>
              </div>
              <div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progress} 
                    style={{ width: `${(project.completed_tasks / project.total_tasks) * 100}%` }}
                  >
                    <span className={styles.progressPercent}>
                      {Math.round((project.completed_tasks / project.total_tasks) * 100)}%
                    </span>
                  </div>
                </div>
                <div className={styles.progressText}>
                  Due {new Date(project.due_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className={styles.sectionHeader}>Shared Projects</h2>
        <div className={styles.projectsGrid}>
          {sharedProjects.map(project => (
            <div key={project.id} className={styles.projectCard}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className={styles.projectStats}>
                <div>
                  <span>Current Sprint: {project.current_sprint?.name}</span>
                </div>
                <div className={styles.taskStats}>
                  <span>Total Tasks: {project.total_tasks}</span>
                  <span className={styles.overdue}>Overdue: {project.overdue_tasks}</span>
                </div>
              </div>
              <div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progress} 
                    style={{ width: `${(project.completed_tasks / project.total_tasks) * 100}%` }}
                  >
                    <span className={styles.progressPercent}>
                      {Math.round((project.completed_tasks / project.total_tasks) * 100)}%
                    </span>
                  </div>
                </div>
                <div className={styles.progressText}>
                  Due {new Date(project.due_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Workspace;