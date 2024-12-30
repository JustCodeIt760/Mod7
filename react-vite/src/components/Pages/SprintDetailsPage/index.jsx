import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkSetSprint } from '../../../redux/sprint';
import { thunkLoadFeatures, thunkMoveFeature } from '../../../redux/feature';
import styles from './SprintDetailsPage.module.css';

const SprintDetailsPage = () => {
  const { projectId, sprintId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sprint = useSelector(state => state.sprints.singleSprint);
  const features = useSelector(state => Object.values(state.features.allFeatures)
    .filter(f => f.sprint_id === parseInt(sprintId)));
  const isLoading = useSelector(state => state.sprints.isLoading);

  useEffect(() => {
    dispatch(thunkSetSprint(projectId, sprintId));
    dispatch(thunkLoadFeatures(projectId));
  }, [dispatch, projectId, sprintId]);

  if (isLoading) return <div>Loading...</div>;
  if (!sprint) return <div>Sprint not found</div>;

  // Calculate sprint progress
  const completedFeatures = features.filter(f => f.status === 'Completed').length;
  const progress = features.length ? Math.round((completedFeatures / features.length) * 100) : 0;

  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(sprint.end_date);
  const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  // Group features by status
  const featuresByStatus = features.reduce((acc, feature) => {
    acc[feature.status] = acc[feature.status] || [];
    acc[feature.status].push(feature);
    return acc;
  }, {});

  // Handle drag and drop
  const handleDragStart = (e, feature) => {
    e.dataTransfer.setData('featureId', feature.id);
    e.dataTransfer.setData('currentStatus', feature.status);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const featureId = e.dataTransfer.getData('featureId');
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (currentStatus !== newStatus) {
      await dispatch(thunkMoveFeature(projectId, featureId, sprintId, newStatus));
    }
  };

  return (
    <div className={styles.sprintDetailsContainer}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          ← Back to Project
        </button>
        <h1>{sprint.name}</h1>
      </div>

      <div className={styles.sprintOverview}>
        <div className={styles.sprintStats}>
          <div className={styles.statCard}>
            <h3>Progress</h3>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{progress}% Complete</span>
          </div>

          <div className={styles.statCard}>
            <h3>Timeline</h3>
            <p>Start: {new Date(sprint.start_date).toLocaleDateString()}</p>
            <p>End: {new Date(sprint.end_date).toLocaleDateString()}</p>
            <p className={styles.daysRemaining}>
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Sprint ended'}
            </p>
          </div>

          <div className={styles.statCard}>
            <h3>Features</h3>
            <p>Total: {features.length}</p>
            <p>Completed: {completedFeatures}</p>
            <p>Remaining: {features.length - completedFeatures}</p>
          </div>
        </div>
      </div>

      <div className={styles.featureBoards}>
        {['Not Started', 'In Progress', 'Completed'].map(status => (
          <div
            key={status}
            className={styles.featureColumn}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h2>{status}</h2>
            <div className={styles.featureList}>
              {(featuresByStatus[status] || []).map(feature => (
                <div
                  key={feature.id}
                  className={styles.featureCard}
                  draggable
                  onDragStart={(e) => handleDragStart(e, feature)}
                >
                  <h3>{feature.name}</h3>
                  <p>{feature.description}</p>
                  <div className={styles.featureFooter}>
                    <span className={styles.priority}>Priority: {feature.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprintDetailsPage;
