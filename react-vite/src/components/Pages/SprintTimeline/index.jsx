import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { thunkLoadSprints, thunkSetSprint } from '../../../redux/sprint';
import { thunkLoadFeatures, selectAllFeatures, updateFeature } from '../../../redux/feature';
import { loadTasks, selectAllTasks } from '../../../redux/task';
import { csrfFetch } from '../../../utils/csrf';
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

const TeamLegend = () => (
  <div className={styles.legend}>
    <h3 className={styles.legendTitle}>Team Members</h3>
    <div className={styles.legendItems}>
      {Object.entries(TEAM_COLORS).map(([userId, colors]) => (
        <div key={userId} className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: colors.vibrant }}></div>
          <span>{userId === '1' ? 'Demo User' : userId === '2' ? 'Sarah' : 'Mike'}</span>
        </div>
      ))}
    </div>
  </div>
);

const SprintTimeline = () => {
  const { projectId, sprintId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hoveredTask, setHoveredTask] = useState(null);
  const [error, setError] = useState(null);

  const currentUser = useSelector(state => state.session.user);
  const sprint = useSelector(state => state.sprints.singleSprint);
  const features = useSelector(selectAllFeatures);
  const allTasks = useSelector(selectAllTasks);
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
        console.log('Loaded features:', featuresResult);
        if (!featuresResult) {
          setError('Failed to load features');
          return;
        }

        // Load tasks for each feature in the sprint
        const sprintFeatures = featuresResult.filter(f => f.sprint_id === parseInt(sprintId));
        for (const feature of sprintFeatures) {
          try {
            const tasksResponse = await csrfFetch(`/projects/${projectId}/features/${feature.id}/tasks`);
            if (!tasksResponse.ok) {
              throw new Error(`Failed to load tasks for feature ${feature.id}`);
            }
            const tasksData = await tasksResponse.json();
            dispatch(loadTasks(tasksData));
            // Update feature with task IDs
            dispatch(updateFeature({
              ...feature,
              tasks: tasksData.map(task => task.id)
            }));
          } catch (err) {
            console.error(`Error loading tasks for feature ${feature.id}:`, err);
          }
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

  // Debug logs for features and tasks
  useEffect(() => {
    console.log('Current features:', features);
    const filteredFeatures = features.filter(f => f.sprint_id === parseInt(sprintId));
    console.log('Filtered features:', filteredFeatures);
    console.log('All tasks:', allTasks);
  }, [features, sprintId, allTasks]);

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
    .flatMap(feature => {
      const featureTasks = feature.tasks?.map(taskId => allTasks[taskId]).filter(Boolean) || [];
      return featureTasks.map(task => {
        console.log('Task dates:', {
          taskId: task.id,
          raw_start: task.start_date,
          raw_end: task.due_date,
          parsed_start: new Date(task.start_date),
          parsed_end: new Date(task.due_date)
        });
        return {
          id: task.id,
          featureName: feature.name,
          taskName: task.name,
          startDate: new Date(task.start_date),
          endDate: new Date(task.due_date),
          status: task.status,
          assignees: [task.assigned_to, task.created_by].filter(Boolean),
          description: task.description,
          priority: task.priority
        };
      });
    });

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

    // Get color based on primary assignee
    const primaryAssignee = task.assignees[0];
    const color = TEAM_COLORS[primaryAssignee]?.vibrant || '#6B7280';

    return {
      left,
      width,
      '--task-color': color
    };
  };

  const renderTask = (task) => {
    // Validate dates
    if (!task.startDate || !task.endDate || isNaN(task.startDate.getTime()) || isNaN(task.endDate.getTime())) {
      console.error('Invalid dates for task:', {
        taskId: task.id,
        startDate: task.startDate,
        endDate: task.endDate
      });
      return null;
    }

    const style = getTaskStyle(task, task.startDate, task.endDate);

    return (
      <div key={task.id} className={styles.taskRow}>
        <div
          className={styles.taskBar}
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
              <div className={styles.tooltipLabel}>Assignee</div>
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
      <TeamLegend />
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
