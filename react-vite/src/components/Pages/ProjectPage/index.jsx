import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkSetProject } from '../../../redux/project';
import { thunkLoadFeatures, thunkMoveFeature, thunkAddFeature } from '../../../redux/feature';
import { thunkLoadSprints } from '../../../redux/sprint';
import styles from './ProjectPage.module.css';

const ProjectPage = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const project = useSelector(state => state.projects.singleProject);
  const features = useSelector(state => Object.values(state.features.allFeatures));
  const sprints = useSelector(state => Object.values(state.sprints.allSprints));
  const isLoading = useSelector(state => state.projects.isLoading);
  const [currentSprintIndex, setCurrentSprintIndex] = useState(0);

  useEffect(() => {
    dispatch(thunkSetProject(projectId));
    dispatch(thunkLoadFeatures(projectId));
    dispatch(thunkLoadSprints(projectId));
  }, [dispatch, projectId]);

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const parkingLotFeatures = features.filter(feature => !feature.sprint_id);
  const currentSprint = sprints[currentSprintIndex];
  const sprintFeatures = features.filter(feature => feature.sprint_id === currentSprint?.id);

  const handlePreviousSprint = () => {
    if (currentSprintIndex > 0) {
      setCurrentSprintIndex(currentSprintIndex - 1);
    }
  };

  const handleNextSprint = () => {
    if (currentSprintIndex < sprints.length - 1) {
      setCurrentSprintIndex(currentSprintIndex + 1);
    }
  };

  const handleSprintClick = (sprintId) => {
    navigate(`/projects/${projectId}/sprints/${sprintId}`);
  };

  const handleDragStart = (e, featureId) => {
    e.dataTransfer.setData('featureId', featureId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.dragOver);
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(styles.dragOver);
  };

  const handleDropOnParkingLot = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragOver);
    const featureId = e.dataTransfer.getData('featureId');
    await dispatch(thunkMoveFeature(projectId, featureId, null));
  };

  const handleDropOnSprint = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragOver);
    const featureId = e.dataTransfer.getData('featureId');
    if (currentSprint) {
      await dispatch(thunkMoveFeature(projectId, featureId, currentSprint.id));
    }
  };

  const handleAddFeature = async () => {
    const newFeature = {
      name: 'New Feature',
      description: 'This is a new feature',
      status: 'Not Started',
      priority: 1
    };
    await dispatch(thunkAddFeature(projectId, newFeature));
  };

  return (
    <div className={styles.projectPage}>
      <header className={styles.projectHeader}>
        <h1>{project.name}</h1>
      </header>

      <section
        className={styles.parkingLotSection}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropOnParkingLot}
      >
        <div className={styles.parkingLotHeader}>
          <h2>Parking Lot</h2>
          <button onClick={handleAddFeature} className={styles.addFeatureButton}>+</button>
        </div>
        <div className={styles.parkingLotContent}>
          {parkingLotFeatures.map(feature => (
            <div
              key={feature.id}
              className={styles.featureCard}
              draggable
              onDragStart={(e) => handleDragStart(e, feature.id)}
            >
              <h3>{feature.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section
        className={styles.sprintSection}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropOnSprint}
      >
        <div className={styles.sprintHeader}>
          <button
            className={styles.carouselButton}
            onClick={handlePreviousSprint}
            disabled={currentSprintIndex === 0}
          >
            ←
          </button>
          <h2
            className={styles.sprintName}
            onClick={() => currentSprint && handleSprintClick(currentSprint.id)}
          >
            {currentSprint?.name || 'No Sprints'}
          </h2>
          <button
            className={styles.carouselButton}
            onClick={handleNextSprint}
            disabled={currentSprintIndex === sprints.length - 1}
          >
            →
          </button>
        </div>
        <div className={styles.sprintContent}>
          {sprintFeatures.map(feature => (
            <div
              key={feature.id}
              className={styles.sprintFeature}
              draggable
              onDragStart={(e) => handleDragStart(e, feature.id)}
            >
              <h3>{feature.name}</h3>
              <div className={styles.taskList}>
                <p>task 1</p>
                <p>task 2</p>
                <p>task 3</p>
                <p>task 4</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectPage;