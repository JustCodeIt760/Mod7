import { useNavigate } from 'react-router-dom';
import styles from './FeatureCard.module.css';

const FeatureCard = ({ feature }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${feature.project_id}/features/${feature.id}`);
  };

  return (
    <div className={styles.featureCard} onClick={handleClick}>
      <h3>{feature.name}</h3>
      <p>{feature.description}</p>
      <div className={styles.status}>
        <span>Status: {feature.status || 'Not Started'}</span>
        <span>Priority: {feature.priority || 'None'}</span>
      </div>
    </div>
  );
};

export default FeatureCard;