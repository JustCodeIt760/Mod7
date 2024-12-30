import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkLoadProjects } from '../../../redux/project';
import { thunkLoadTasks } from '../../../redux/task';
import styles from './Workspace.module.css';

const Workspace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const projects = useSelector(state => Object.values(state.projects.allProjects));
  const tasks = useSelector(state => Object.values(state.tasks.allTasks));
  const user = useSelector(state => state.session.user);

  useEffect(() => {
    dispatch(thunkLoadProjects());
    dispatch(thunkLoadTasks());
  }, [dispatch]);

  const ownedProjects = projects.filter(project => project.ownerId === user?.id);
  const sharedProjects = projects.filter(project => project.ownerId !== user?.id);

  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter(task => new Date(task.dueDate) < new Date()).length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleProjectClick = (projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1>Welcome to your workspace</h1>

      <div className={styles.currentSprint}>
        <h2>Current Sprint</h2>
        <p>Sprint Name: Sprint 1</p>
        <p>End Date: December 31, 2023</p>
      </div>

      <div className={styles.taskStats}>
        <div className={styles.statCard}>
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Overdue Tasks</h3>
          <p>{overdueTasks}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Progress</h3>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress.toFixed(1)}%</p>
        </div>
      </div>

      <div className={styles.projectsSection}>
        <div className={styles.ownedProjects}>
          <h2>Your Projects</h2>
          <div className={styles.projectGrid}>
            {ownedProjects.map(project => (
              <div
                key={project.id}
                className={styles.projectCard}
                onClick={() => handleProjectClick(project.id)}
              >
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sharedProjects}>
          <h2>Shared Projects</h2>
          <div className={styles.projectGrid}>
            {sharedProjects.map(project => (
              <div
                key={project.id}
                className={styles.projectCard}
                onClick={() => handleProjectClick(project.id)}
              >
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;