import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FeatureCard from '../FeatureCard';
import styles from './FeatureList.module.css';
import { thunkLoadFeatures } from '../../../redux/feature';

const FeatureList = ({ projectId }) => {
  const dispatch = useDispatch();
  const features = useSelector(state => Object.values(state.features.allFeatures));
  const isLoading = useSelector(state => state.features.isLoading);

  useEffect(() => {
    if (projectId) {
      dispatch(thunkLoadFeatures(projectId));
    }
  }, [dispatch, projectId]);

  if (isLoading) return (
    <div className={styles.featureList}>
      <div className={styles.loading}>Loading features...</div>
    </div>
  );

  return (
    <div className={styles.featureList}>
      {features.length === 0 ? (
        <div className={styles.empty}>
          No features yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {features.map(feature => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureList;