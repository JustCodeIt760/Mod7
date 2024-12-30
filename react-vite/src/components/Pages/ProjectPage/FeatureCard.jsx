import styles from './ProjectPage.module.css';

const FeatureCard = ({ feature }) => {
  return (
    <div className={styles.featureCard}>
      <h3>{feature.name}</h3>
      <p>{feature.description}</p>
      <div className={styles.featureDetails}>
        <span className={styles.status}>Status: {feature.status}</span>
        <span className={styles.priority}>Priority: {feature.priority}</span>
      </div>
    </div>
  );
};

export default FeatureCard;
