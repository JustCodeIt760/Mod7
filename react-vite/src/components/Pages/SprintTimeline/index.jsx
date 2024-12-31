import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { thunkLoadSprints, thunkSetSprint } from '../../../redux/sprint';
import { thunkLoadFeatures, selectAllFeatures } from '../../../redux/feature';
import styles from './SprintTimeline.module.css';

const TEAM_COLORS = {
  1: {  // Demo user
    vibrant: '#2563eb',  // Solid blue
    pale: 'rgba(37, 99, 235, 0.25)'  // Transparent blue
  },
  2: {  // Sarah
    vibrant: '#c026d3',  // Solid purple
    pale: 'rgba(192, 38, 211, 0.25)'  // Transparent purple
  },
  3: {  // Mike
    vibrant: '#0d9488',  // Solid teal
    pale: 'rgba(13, 148, 136, 0.25)'  // Transparent teal
  }
};

const SprintTimeline = () => {
  const { projectId, sprintId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hoveredTask, setHoveredTask] = useState(null);
  const [error, setError] = useState(null);

  const currentUser = useSelector(state => state.session.user);
  const sprint = useSelector(state => state.sprints.singleSprint);
  const features = useSelector(selectAllFeatures);
  const isLoading = useSelector(state => state.sprints.isLoading);
  const sprintErrors = useSelector(state => state.sprints.errors);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sprintsResult = await dispatch(thunkLoadSprints(projectId));
        if (!sprintsResult) {
          setError('Failed to load sprints');
          return;
        }

        const sprintResult = await dispatch(thunkSetSprint(projectId, sprintId));
        if (!sprintResult) {
          setError('Sprint not found');
          return;
        }

        const featuresResult = await dispatch(thunkLoadFeatures(projectId));
        if (!featuresResult) {
          setError('Failed to load features');
          return;
        }
      } catch (err) {
        setError('Failed to load sprint data');
      }
    };
    loadData();
  }, [dispatch, projectId, sprintId]);

  useEffect(() => {
    if (sprintErrors) {
      setError(sprintErrors.message || 'An error occurred');
    }
  }, [sprintErrors]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(`/projects/${projectId}`)}>
          Back to Project
        </button>
      </div>
    );
  }

  if (isLoading || !sprint) {
    return (
      <div className={styles.loadingContainer}>
        <h2>Loading Sprint Timeline...</h2>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  // Generate array of days for the sprint
  const days = eachDayOfInterval({
    start: new Date(sprint.start_date),
    end: new Date(sprint.end_date)
  });

  // Convert features to tasks format
  const tasks = features
    .filter(f => f.sprint_id === parseInt(sprintId))
    .flatMap(feature => feature.tasks?.map(task => ({
      id: task.id,
      featureName: feature.name,
      taskName: task.name,
      startDate: new Date(task._start_date),
      endDate: new Date(task._due_date),
      status: task.status,
      assignees: [task.assigned_to, task._created_by].filter(Boolean), // Include both assigned and creator
      description: task.description,
      priority: task.priority
    })) || []);

  // Split tasks into user's tasks and other tasks
  const { userTasks, otherTasks } = tasks.reduce((acc, task) => {
    if (task.assignees.includes(currentUser?.id)) {
      acc.userTasks.push(task);
    } else {
      acc.otherTasks.push(task);
    }
    return acc;
  }, { userTasks: [], otherTasks: [] });

  const getTaskStyle = (task, startDate, endDate) => {
    const totalDays = days.length;
    const startDay = days.findIndex(day => isSameDay(day, startDate));
    const endDay = days.findIndex(day => isSameDay(day, endDate));

    const left = `${(startDay / totalDays) * 100}%`;
    const width = `${((endDay - startDay + 1) / totalDays) * 100}%`;

    // Get colors based on assignees
    const colors = task.assignees
      .map(userId => TEAM_COLORS[userId])
      .filter(Boolean);

    if (colors.length === 0) {
      return {
        left,
        width,
        '--task-color': '#6B7280'  // Default gray for unassigned
      };
    } else if (colors.length === 1) {
      return {
        left,
        width,
        '--task-color': colors[0].vibrant
      };
    } else {
      return {
        left,
        width,
        '--first-color': colors[0].vibrant,
        '--second-color': colors[1].vibrant
      };
    }
  };

  const renderTask = (task) => {
    const style = getTaskStyle(task, task.startDate, task.endDate);
    const isMultipleAssignees = task.assignees.length > 1;

    return (
      <div key={task.id} className={styles.taskRow}>
        <div
          className={`${styles.taskBar} ${isMultipleAssignees ? styles.striped : styles.single}`}
          style={style}
          onMouseEnter={() => setHoveredTask(task)}
          onMouseLeave={() => setHoveredTask(null)}
        >
          <div className={styles.taskContent}>
            <span className={styles.taskName}>{task.taskName}</span>
          </div>
        </div>
        {hoveredTask?.id === task.id && (
          <div className={styles.tooltip}>
            <div className={styles.tooltipTitle}>{task.taskName}</div>
            <div className={styles.tooltipSection}>
              <div className={styles.tooltipLabel}>Feature</div>
              <div>{task.featureName}</div>
            </div>
            <div className={styles.tooltipSection}>
              <div className={styles.tooltipLabel}>Assignees</div>
              <div>{task.assignees.map(id => `User ${id}`).join(', ')}</div>
            </div>
            <div className={styles.tooltipSection}>
              <div className={styles.tooltipLabel}>Dates</div>
              <div>
                {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
              </div>
            </div>
            {task.description && (
              <div className={styles.tooltipSection}>
                <div className={styles.tooltipLabel}>Description</div>
                <div>{task.description}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.sprintView}>
      <div className={styles.timelineHeader}>
        {days.map(day => (
          <div key={day.toISOString()} className={styles.dayMarker}>
            {format(day, 'MMM d')}
          </div>
        ))}
      </div>

      <div className={styles.contentWrapper}>
        {userTasks.length > 0 && (
          <div className={styles.tasksSection}>
            <h3 className={styles.sectionTitle}>Your Tasks</h3>
            {userTasks.map(renderTask)}
          </div>
        )}

        {otherTasks.length > 0 && (
          <div className={styles.tasksSection}>
            <h3 className={styles.sectionTitle}>Team Tasks</h3>
            {otherTasks.map(renderTask)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintTimeline;
