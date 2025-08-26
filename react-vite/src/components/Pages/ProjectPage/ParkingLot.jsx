import { useState } from 'react';
import { FeatureCard } from './';
import { thunkMoveFeature } from '../../../redux/feature';
import { useDispatch } from 'react-redux';
import AddFeatureModal from './AddFeatureModal';
import styles from './styles/ParkingLot.module.css';

function ParkingLot({ features = [], projectId }) {
  const dispatch = useDispatch();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddFeature = () => {
    setShowAddModal(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.dragOver);
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(styles.dragOver);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragOver);

    const featureId = e.dataTransfer.getData('featureId');
    const sourceType = e.dataTransfer.getData('sourceType');

    if (sourceType === 'sprint') {
      // Moving to parking lot - set sprint_id to null
      await dispatch(thunkMoveFeature(projectId, featureId, null));
    }
  };

  return (
    <>
      <section
        className={styles.parkingLotSection}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
              sourceType="parking"
            />
          ))}
        </div>
      </section>

      <AddFeatureModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        projectId={projectId}
      />
    </>
  );
}

export default ParkingLot;
