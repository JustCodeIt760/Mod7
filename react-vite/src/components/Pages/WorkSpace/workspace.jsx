import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { useModal } from '../../../context/Modal';
import ProjectFormModal from '../../../context/ProjectFormModal';
import styles from './Workspace.module.css';

function Workspace() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const user = useSelector(state => state.session.user);
  const projects = useSelector(state => state.projects?.allProjects || {});

  // Filter projects based on ownership
  const ownedProjects = Object.values(projects).filter(
    project => project.owner_id === user?.id
  );
  const sharedProjects = Object.values(projects).filter(
    project => project.owner_id !== user?.id
  );

  const handleCreateProject = () => {
    openModal(<ProjectFormModal type="create" project={null} />);
  };

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.header}>
        <h1>WorkSpace</h1>
        <button className={styles.createButton} onClick={handleCreateProject}>
          Create a Project
        </button>
      </div>

      <div className={styles.projectsSection}>
        <h2 className={styles.sectionHeader}>Owned Projects</h2>
        <div className={styles.projectsGrid}>
          {ownedProjects.map(project => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={styles.projectLink}
            >
              <div className={styles.projectCard}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className={styles.projectStats}>
                  <div>
                    <span>
                      Current Sprint:{' '}
                      {project.current_sprint?.name || 'No active sprint'}
                    </span>
                  </div>
                  <div className={styles.taskStats}>
                    <span>Total Tasks: {project.total_tasks || 0}</span>
                    <span className={styles.overdue}>
                      Overdue: {project.overdue_tasks || 0}
                    </span>
                  </div>
                  <div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{
                          width: `${
                            project.total_tasks
                              ? (project.completed_tasks /
                                  project.total_tasks) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className={styles.progressPercent}>
                      {project.total_tasks
                        ? Math.round(
                            (project.completed_tasks / project.total_tasks) *
                              100
                          )
                        : 0}
                      % Complete
                    </div>
                    <div className={styles.progressText}>
                      Due {new Date(project.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>

        <h2 className={styles.sectionHeader}>Shared Projects</h2>
        <div className={styles.projectsGrid}>
          {sharedProjects.map(project => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={styles.projectLink}
            >
              <div className={styles.projectCard}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className={styles.projectStats}>
                  <div>
                    <span>
                      Current Sprint:{' '}
                      {project.current_sprint?.name || 'No active sprint'}
                    </span>
                  </div>
                  <div className={styles.taskStats}>
                    <span>Total Tasks: {project.total_tasks || 0}</span>
                    <span className={styles.overdue}>
                      Overdue: {project.overdue_tasks || 0}
                    </span>
                  </div>
                  <div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{
                          width: `${
                            project.total_tasks
                              ? (project.completed_tasks /
                                  project.total_tasks) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className={styles.progressPercent}>
                      {project.total_tasks
                        ? Math.round(
                            (project.completed_tasks / project.total_tasks) *
                              100
                          )
                        : 0}
                      % Complete
                    </div>
                    <div className={styles.progressText}>
                      Due {new Date(project.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
      {/* <ProjectFormModal /> */}
    </div>
  );
}

export default Workspace;
