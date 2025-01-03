import { FeatureCard } from './';
import styles from './ProjectPage.module.css';

function ParkingLot({ features = [] }) {
  return (
    <section className={styles.parkingLotSection}>
      <div className={styles.parkingLotHeader}>
        <h2>Parking Lot</h2>
        <button className={styles.addFeatureButton}>+</button>
      </div>
      <div className={styles.parkingLotContent}>
        {features?.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}

export default ParkingLot;
