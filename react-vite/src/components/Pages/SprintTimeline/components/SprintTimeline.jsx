// components/SprintTimeline.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkSetSprint } from '../../../../redux/sprint';
import {
  thunkLoadProjectData,
  selectProjectPageData,
} from '../../../../redux/project';
import SprintHeader from './SprintHeader';
import TimelineGrid from './TimelineGrid';
import TaskHoverCard from './TaskHoverCard';
import TaskModal from './TaskModal';
import useMousePosition from '../../../../hooks/useMousePosition';
import styles from '../styles/SprintTimeline.module.css';

const SprintTimeline = () => {
  const { projectId, sprintId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mousePosition = useMousePosition();

  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [error, setError] = useState(null);

  const projectData = useSelector((state) =>
    selectProjectPageData(state, projectId)
  );
  const sprint = useSelector((state) => state.sprints.singleSprint);
  const isLoading = useSelector((state) => state.sprints.isLoading);
  const users = useSelector((state) => state.users.allUsers);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(thunkLoadProjectData(projectId));
        const sprintResult = await dispatch(
          thunkSetSprint(projectId, sprintId)
        );

        if (!sprintResult) {
          setError('Sprint not found');
        }
      } catch (err) {
        console.error('Error loading sprint timeline:', err);
        setError('Failed to load sprint data');
      }
    };
    loadData();
  }, [dispatch, projectId, sprintId]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          className={styles.backButton}
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          Back to Project
        </button>
      </div>
    );
  }

  if (isLoading || !projectData || !sprint) {
    return (
      <div className={styles.loadingContainer}>
        <h2>Loading Sprint Timeline...</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <SprintHeader projectId={projectId} sprint={sprint} />

      <TimelineGrid
        sprint={sprint}
        onTaskSelect={setSelectedTask}
        onTaskHover={setHoveredTask}
        users={users}
        projectId={projectId}
      />

      {hoveredTask && !selectedTask && (
        <TaskHoverCard
          task={hoveredTask}
          mousePosition={mousePosition}
          users={users}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          projectId={projectId}
          users={users}
        />
      )}
    </div>
  );
};

export default SprintTimeline;
