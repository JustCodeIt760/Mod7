import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { thunkLoadSprints, thunkSetSprint } from '../../../redux/sprint';
import { thunkLoadFeatures, selectAllFeatures } from '../../../redux/feature';

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

  // Add CSS styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .sprint-view {
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        overflow-x: auto;
      }

      .task-bar {
        transition: all 0.3s ease;
        position: absolute;
        height: 100%;
        border-radius: 0.375rem;
        cursor: pointer;
        min-width: 40px;
      }

      .task-bar.faded {
        opacity: 0.25;
      }

      .task-bar.faded:hover {
        opacity: 1;
      }

      .task-row {
        height: 3rem;
        position: relative;
        margin-bottom: 0.5rem;
      }

      .task-content {
        position: absolute;
        inset: 0;
        padding: 0 0.5rem;
        display: flex;
        align-items: center;
        color: #111827;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .task-bar[data-small="true"] .task-content {
        display: none;
      }

      .task-bar[data-medium="true"] .task-content {
        font-size: 11px;
      }

      .task-bar[data-small="true"]:hover::before {
        content: attr(data-title);
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        white-space: nowrap;
        z-index: 30;
      }

      .tooltip {
        position: absolute;
        z-index: 20;
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        width: 16rem;
        margin-top: -6rem;
      }

      .timeline-header {
        display: flex;
        margin-bottom: 1rem;
        min-width: min-content;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.5rem;
      }

      .day-marker {
        flex: 1;
        text-align: center;
        font-size: 0.75rem;
        color: #666;
        min-width: 30px;
      }

      .tasks-section {
        margin-bottom: 2rem;
      }

      .section-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: #666;
        margin-bottom: 1rem;
      }

      .content-wrapper {
        min-width: min-content;
        padding-right: 1rem;
      }

      .error-container {
        padding: 1rem;
        background: #fee2e2;
        border-radius: 0.5rem;
        margin: 1rem;
      }

      .loading-container {
        padding: 2rem;
        text-align: center;
        color: #666;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  if (error) {
    return (
      <div className="error-container">
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
      <div className="loading-container">
        <h2>Loading Sprint Timeline...</h2>
        <div className="loading-spinner"></div>
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

  const calculatePosition = (startDate, endDate) => {
    const totalDays = days.length;
    const startDayIndex = days.findIndex(day => isSameDay(day, startDate));
    const endDayIndex = days.findIndex(day => isSameDay(day, endDate));

    // If dates are outside sprint range, clamp them
    const clampedStartIndex = Math.max(0, startDayIndex);
    const clampedEndIndex = Math.min(totalDays - 1, endDayIndex >= 0 ? endDayIndex : totalDays - 1);

    const left = (clampedStartIndex / totalDays) * 100;
    const width = ((clampedEndIndex - clampedStartIndex + 1) / totalDays) * 100;

    return { left, width };
  };

  const generateGradient = (assignees, isUserTask, isHovered = false) => {
    const colorType = isUserTask || isHovered ? 'vibrant' : 'pale';

    // For single assignee, return solid color
    if (assignees.length === 1) {
      return TEAM_COLORS[assignees[0]]?.[colorType] || '#94a3b8'; // Default color if user not found
    }

    // For multiple assignees, create gradient
    const stops = assignees.map((assignee, index) => {
      const color = TEAM_COLORS[assignee]?.[colorType] || '#94a3b8';
      const percentage = (index / (assignees.length - 1)) * 100;
      return `${color} ${percentage}%`;
    });

    return `linear-gradient(to right, ${stops.join(', ')})`;
  };

  const renderTask = (task, isUserTask = false) => {
    const { left, width } = calculatePosition(task.startDate, task.endDate);
    const isHovered = hoveredTask === task;

    const getTaskSize = (width) => {
      if (width < 5) return 'small';
      if (width < 10) return 'medium';
      return 'large';
    };

    const taskSize = getTaskSize(width);
    const taskTitle = `${task.featureName}: ${task.taskName}`;

    return (
      <div className="task-row" key={task.id}>
        <div
          className={`task-bar ${!isUserTask ? 'faded' : ''}`}
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: generateGradient(task.assignees, isUserTask, isHovered)
          }}
          data-small={taskSize === 'small'}
          data-medium={taskSize === 'medium'}
          data-large={taskSize === 'large'}
          data-title={taskTitle}
          onMouseEnter={() => setHoveredTask(task)}
          onMouseLeave={() => setHoveredTask(null)}
          onClick={() => navigate(`/projects/${projectId}/features/${task.id}`)}
        >
          <div className="task-content">
            {taskTitle}
          </div>
        </div>

        {isHovered && (
          <div className="tooltip" style={{
            left: `${left}%`,
            transform: left > 80 ? 'translateX(-100%)' : 'translateX(0)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {taskTitle}
            </div>
            <div>
              <div>{format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}</div>
              <div style={{ marginTop: '0.5rem' }}>
                Status: {task.status}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                Priority: {task.priority}
              </div>
              <div style={{ marginTop: '0.5rem', color: '#666' }}>
                {task.description}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sprint-view">
      <div className="content-wrapper">
        <div className="timeline-header">
          {days.map((day, index) => (
            <div key={index} className="day-marker">
              {index % 2 === 0 && format(day, 'MMM d')}
            </div>
          ))}
        </div>

        {userTasks.length > 0 && (
          <div className="tasks-section">
            <div className="section-title">MY TASKS</div>
            {userTasks.map(task => renderTask(task, true))}
          </div>
        )}

        <div className="tasks-section">
          <div className="section-title">OTHER TASKS</div>
          {otherTasks.map(task => renderTask(task, false))}
        </div>
      </div>
    </div>
  );
};

export default SprintTimeline;
