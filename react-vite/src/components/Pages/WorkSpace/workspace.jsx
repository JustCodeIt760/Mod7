import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import styles from './Workspace.module.css';
import { thunkLoadSprints } from '../../../redux/sprint';
import { thunkLoadProjects } from '../../../redux/project';
import { thunkLoadTasks } from '../../../redux/task';

function Workspace() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.session.user);
  const projects = useSelector(state => state.projects?.allProjects || {});
  const tasks = useSelector(state => state.tasks?.allTasks || {});
  const sprints = useSelector(state => state.sprints?.allSprints || {});
  const [currentSprint, setCurrentSprint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter projects based on ownership
  const ownedProjects = Object.values(projects).filter(project => project.owner_id === user?.id);
  const sharedProjects = Object.values(projects).filter(project => project.owner_id !== user?.id);
  const totalTasks = Object.values(tasks).filter(task => task.project_id === projects.projectId);


  // Fetch projects and sprints when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start loading

      dispatch(thunkLoadProjects());
      dispatch(thunkLoadTasks());
      dispatch(thunkLoadSprints());

      const sprintsArray = Object.values(sprints);
      if (sprintsArray.length === 0) return;

      // Find the closest sprint to today
      const today = new Date();
      const todayTimestamp = today.getTime();

      const findClosestSprint = (sprintsArray) => {
        let closestSprint = null;
        let minDiff = Infinity;

        sprintsArray.forEach((sprint) => {
          const startDate = new Date(sprint.start_date);
          const endDate = new Date(sprint.end_date);

          const startDateTimestamp = startDate.getTime();
          const endDateTimestamp = endDate.getTime();

          const startDiff = Math.abs(todayTimestamp - startDateTimestamp);
          const endDiff = Math.abs(todayTimestamp - endDateTimestamp);

          // Determine the closer sprint based on start or end date
          if (startDiff < minDiff) {
            closestSprint = sprint;
            minDiff = startDiff;
          }
          if (endDiff < minDiff) {
            closestSprint = sprint;
            minDiff = endDiff;
          }
        });

        return closestSprint;
      };

      // Get the closest sprint and set it as the current sprint
      const foundCurrentSprint = findClosestSprint(sprintsArray);
      setCurrentSprint(foundCurrentSprint || null);

      setIsLoading(false); // End loading
    };

    fetchData();
  }, [dispatch, sprints]); // Dependencies ensure it re-runs when sprints or dispatch changes



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
            <NavLink key={project.id} to={`/projects/${project.id}`} className={styles.projectLink}>
              <div className={styles.projectCard}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className={styles.projectStats}>
                  <div>
                    {currentSprint ? (
                      <>
                    <span>Current Sprint: </span>
                    <strong>{currentSprint.name}</strong>
                      </>
                    ) : (
                    <p>No active sprint</p>
                    )}
                  </div>
                  <div className={styles.taskStats}>
                    <span>Total Tasks: {totalTasks.length}</span>
                    <span className={styles.overdue}>Overdue: {project.overdue_tasks || 0}</span>
                  </div>
                  <div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${project.total_tasks ? (project.completed_tasks / project.total_tasks) * 100 : 0}%` }}
                      />
                    </div>
                    <div className={styles.progressPercent}>
                      {project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0}% Complete
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
            <NavLink key={project.id} to={`/projects/${project.id}`} className={styles.projectLink}>
              <div className={styles.projectCard}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className={styles.projectStats}>
                  <div>
                    <span>Current Sprint: {project.current_sprint?.name || 'No active sprint'}</span>
                  </div>
                  <div className={styles.taskStats}>
                    <span>Total Tasks: {project.total_tasks || 0}</span>
                    <span className={styles.overdue}>Overdue: {project.overdue_tasks || 0}</span>
                  </div>
                  <div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${project.total_tasks ? (project.completed_tasks / project.total_tasks) * 100 : 0}%` }}
                      />
                    </div>
                    <div className={styles.progressPercent}>
                      {project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0}% Complete
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
    </div>
  );
}

export default Workspace;