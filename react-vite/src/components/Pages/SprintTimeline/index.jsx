import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLoadSprints } from '../../../redux/sprint';
import { thunkLoadFeatures } from '../../../redux/feature';
import styles from './SprintTimeline.module.css';

const SprintTimeline = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sprints = useSelector(state => Object.values(state.sprints.allSprints));
  const features = useSelector(state => Object.values(state.features.allFeatures));
  const isLoading = useSelector(state => state.sprints.isLoading);

  useEffect(() => {
    dispatch(thunkLoadSprints(projectId));
    dispatch(thunkLoadFeatures(projectId));
  }, [dispatch, projectId]);

  if (isLoading) return <div>Loading...</div>;

  // Sort sprints by start date
  const sortedSprints = [...sprints].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Calculate sprint progress
  const getSprintProgress = (sprintId) => {
    const sprintFeatures = features.filter(f => f.sprint_id === sprintId);
    if (!sprintFeatures.length) return 0;
    const completedFeatures = sprintFeatures.filter(f => f.status === 'Completed').length;
    return Math.round((completedFeatures / sprintFeatures.length) * 100);
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Determine sprint status
  const getSprintStatus = (sprint) => {
    const now = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  };

  // Handle sprint click
  const handleSprintClick = (sprintId) => {
    navigate(`/projects/${projectId}/sprints/${sprintId}`);
  };

  return (
    <div className={styles.timelineContainer}>
      <h1>Sprint Timeline</h1>
      <div className={styles.timeline}>
        {sortedSprints.map((sprint, index) => {
          const progress = getSprintProgress(sprint.id);
          const status = getSprintStatus(sprint);

          return (
            <div key={sprint.id} className={`${styles.sprintCard} ${styles[status]}`}>
              <div className={styles.sprintHeader}>
                <h3
                  className={styles.sprintName}
                  onClick={() => handleSprintClick(sprint.id)}
                >
                  {sprint.name}
                </h3>
                <span className={styles.dates}>
                  {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={styles.sprintStats}>
                <span>{progress}% Complete</span>
                <span>{features.filter(f => f.sprint_id === sprint.id).length} Features</span>
              </div>
              {index < sortedSprints.length - 1 && (
                <div className={styles.connector} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SprintTimeline;
