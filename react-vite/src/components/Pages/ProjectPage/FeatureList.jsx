import { useSelector } from 'react-redux';
import FeatureCard from './FeatureCard';
import styles from './styles/FeatureList.module.css';
const FeatureList = ({ projectId }) => {
  const features = useSelector((state) => state.features.allFeatures);
  const projectFeatures = features
    ? Object.values(features).filter(
        (feature) => feature.project_id === projectId
      )
    : [];

  return (
    <div className={styles.featureList}>
      <h2>Features</h2>
      <div className={styles.featureGrid}>
        {projectFeatures.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
};

export default FeatureList;
