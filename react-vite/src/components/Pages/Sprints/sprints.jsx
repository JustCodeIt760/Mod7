import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkLoadProjects } from '../../../redux/project';
import { thunkLoadSprints } from '../../../redux/sprint';
import { thunkLoadTasks } from '../../../redux/task';
import { thunkLoadFeatures } from '../../../redux/feature';
import { useModal } from '../../../context/Modal';
import TaskFormModal from '../../../context/TaskFormModal';
import styles from './sprints.module.css';
import { refreshAllData } from '../../../redux/shared';

function SprintCard({ sprint, projectName }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const tasks = useSelector(state => state.tasks?.allTasks || {});
  const user = useSelector(state => state.session.user || null);
  // Get features for this sprint
  const features = useSelector(state => state.features.allFeatures || {});
  
  useEffect(() => {
    if (user) {
      dispatch(refreshAllData());
    }
  }, [dispatch, user]);

  // Find tasks for a specific feature
const sprintFeature = Object.values(features).find(
    feature => feature.sprint_id === sprint.id
  );
  
 
  const sprintTasks = Object.values(tasks).filter(
    task => task.feature_id === sprintFeature?.id && task.assigned_to === user?.id
  );
  
  // Calculate task statistics
  const totalTasks = sprintTasks.length;
  const completedTasks = sprintTasks.filter(task => task.status === 'Completed').length;
  const progressPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Group tasks by status
  const tasksByStatus = {
    not_started: sprintTasks.filter(task => task.status === 'Not Started'),
    in_progress: sprintTasks.filter(task => task.status === 'In Progress'),
    completed: sprintTasks.filter(task => task.status === 'Completed')
  };



  const handleSprintClick = (e) => {
    if (sprint && sprint.project_id && sprint.id) {
      navigate(`/projects/${sprint.project_id}/sprints/${sprint.id}`);
    }
  };

  const handleAddTask = (e) => {
    e.stopPropagation();
    if (!sprintFeature) {
      console.error('No feature found for this sprint');
      return;
    }
    openModal(
      <TaskFormModal 
        projectId={Number(sprint.project_id)}
        sprintId={Number(sprint.id)}
        
      />
    );
  };

  
  return (
    <div className={styles.sprintCard}>
      <div className={styles.sprintHeader}>
        <div className={styles.sprintInfo}>
          <h3 onClick={handleSprintClick}>{sprint.name}</h3>
          <p className={styles.projectName}>Project: {projectName}</p>
          <p className={styles.dates}>
            {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
          </p>
        </div>
        <button 
          className={styles.addTaskButton}
          onClick={handleAddTask}
        >
          Add Task
        </button>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineBar}>
          <div 
            className={styles.progressBar} 
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: '#3498db', // Nice blue color
              height: '100%',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <div className={styles.progressStats}>
          <span>{completedTasks} of {totalTasks} tasks completed</span>
          <span>{progressPercentage}%</span>
        </div>
      </div>

      <div className={styles.taskSection}>
        {totalTasks > 0 ? (
          <div className={styles.taskColumns}>
            <div className={styles.taskColumn}>
              <h4>To Do ({tasksByStatus.not_started.length})</h4>
            </div>

            <div className={styles.taskColumn}>
              <h4>In Progress ({tasksByStatus.in_progress.length})</h4>
            </div>

            <div className={styles.taskColumn}>
              <h4>Completed ({tasksByStatus.completed.length})</h4>
            </div>
          </div>
        ) : (
          <p className={styles.taskInfo}>
            No tasks assigned to you in this sprint yet
          </p>
        )}
      </div>
    </div>
  );
}

function Sprints() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.session.user);
  const sprints = useSelector(state => state.sprints.allSprints);
  const projects = useSelector(state => state.projects.allProjects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // First load projects
          const projectsResponse = await dispatch(thunkLoadProjects());
          
          if (projectsResponse) {
            const projectIds = Object.keys(projectsResponse);
            
            // Load sprints, features, and tasks
            await Promise.all([
              ...projectIds.map(projectId => dispatch(thunkLoadSprints(projectId))),
              ...projectIds.map(projectId => dispatch(thunkLoadFeatures(projectId))),
              ...projectIds.map(projectId => dispatch(thunkLoadTasks(projectId)))
            ]);
          }
        } catch (error) {
          console.error('Error loading sprints data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [dispatch, user]);

  // Get current sprints from projects the user is involved in
  const currentSprints = Object.values(sprints).filter(sprint => {
    const project = projects[sprint.project_id];
    const now = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    
    return project && 
           (project.owner_id === user?.id || project.members?.includes(user?.id)) &&
           now >= startDate && now <= endDate;
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading sprints...</div>;
  }

  return (
    <div className={styles.sprintsContainer}>
      <div className={styles.header}>
        <h1>Current Sprints</h1>
      </div>

      <div className={styles.sprintsGrid}>
        {currentSprints.length > 0 ? (
          currentSprints.map(sprint => (
            <SprintCard 
              key={sprint.id} 
              sprint={sprint} 
              projectName={projects[sprint.project_id]?.name || 'Unknown Project'}
            />
          ))
        ) : (
          <div className={styles.noSprints}>
            <p>No active sprints found. Active sprints will appear here when they start.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sprints;