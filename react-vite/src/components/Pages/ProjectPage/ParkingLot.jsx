import { FeatureCard } from './';
import { thunkAddFeature } from '../../../redux/feature';
import { useDispatch } from 'react-redux';
import styles from './styles/ParkingLot.module.css';

function ParkingLot({ features = [], projectId }) {
  const dispatch = useDispatch();
  const handleAddFeature = async () => {
    const featureData = {
      name: 'New Feature',
      description: '',
      priority: 0,
      status: 'Not Started',
    };

    await dispatch(thunkAddFeature(projectId, featureData));
  };
  return (
    <section className={styles.parkingLotSection}>
      <div className={styles.parkingLotHeader}>
        <h2>Parking Lot</h2>
        <button className={styles.addFeatureButton} onClick={handleAddFeature}>
          +
        </button>
      </div>
      <div className={styles.parkingLotContent}>
        {features?.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            projectId={projectId}
          />
        ))}
      </div>
    </section>
  );
}

export default ParkingLot;
