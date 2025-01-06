import { FeatureCard } from './';
import { useDispatch } from 'react-redux';
import { thunkMoveFeature } from '../../../redux/feature';
import styles from './styles/SprintContent.module.css';
import { useState } from 'react';

function SprintContent({ sprint, features, projectId, normalizeTask }) {
  const dispatch = useDispatch();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const featureId = e.dataTransfer.getData('featureId');
    const sourceType = e.dataTransfer.getData('sourceType');

    if (sourceType === 'parking') {
      setIsLoading(true);
      try {
        await dispatch(thunkMoveFeature(projectId, featureId, sprint.id));
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!sprint || !features.length) {
    return (
      <div
        className={`${styles.emptySprintContent} ${
          isDragOver ? styles.dragOver : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>
          {isDragOver ? 'Drop to add to sprint' : 'No features in this sprint'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.sprintContent} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {features.map((feature) => (
        <FeatureCard
          key={feature.id}
          feature={feature}
          projectId={projectId}
          showTasks={true}
          normalizeTask={normalizeTask}
          sourceType="sprint"
        />
      ))}
    </div>
  );
}

export default SprintContent;
