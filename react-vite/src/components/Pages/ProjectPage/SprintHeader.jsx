import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SprintControls from './SprintControls';
import EditableField from '../../utils/EditableField';
import { selectAllSprints, thunkUpdateSprint } from '../../../redux/sprint';
import styles from './styles/SprintHeader.module.css';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';

function SprintHeader({ sprint, onPrevious, onNext, onAddSprint }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState(null); // 'start' or 'end'
  const [isEditingName, setIsEditingName] = useState(false);
  const dispatch = useDispatch();
  const allSprints = useSelector(selectAllSprints);

  const handleSaveName = async (newName) => {
    if (newName !== sprint.name) {
      const sprintData = {
        id: sprint.id,
        name: newName,
      };
      const result = await dispatch(
        thunkUpdateSprint(sprint.project_id, sprintData)
      );
      if (result) setIsEditingName(false);
    }
  };

  const handleDateClick = (type) => {
    if (isEditingName) {
      setDateType(type);
      setShowDatePicker(true);
    }
  };

  const handleDateChange = async (date) => {
    const sprintData = {
      id: sprint.id,
      [dateType === 'start' ? 'start_date' : 'end_date']: date, // Just send the date object
    };

    const result = await dispatch(
      thunkUpdateSprint(sprint.project_id, sprintData)
    );
    if (result) {
      setShowDatePicker(false);
      setDateType(null);
    }
  };

  const handleDeleteSuccess = () => {
    const remainingSprints = allSprints.filter((s) => s.id !== sprint.id);

    if (remainingSprints.length > 0) {
      const currentIndex = allSprints.findIndex((s) => s.id === sprint.id);
      if (currentIndex === 0) {
        onNext();
      } else {
        onPrevious();
      }
    }
  };

  return (
    <div className={styles.sprintHeader}>
      <div className={styles.sprintNavigation}>
        <button
          className={styles.carouselButton}
          onClick={onPrevious}
          disabled={!sprint}
        >
          ←
        </button>

        <div className={styles.sprintInfo}>
          {!sprint ? (
            <h2 className={styles.sprintName}>No Sprints</h2>
          ) : (
            <div className={styles.sprintContent}>
              <EditableField
                value={sprint.name}
                onSave={handleSaveName}
                isEditing={isEditingName}
                setIsEditing={setIsEditingName}
                className={styles.sprintName}
                containerClassName={styles.sprintHeader}
                excludeClassNames={[styles.editIcon, styles.deleteIcon]}
                modalClasses={[
                  modalStyles.modalOverlay,
                  modalStyles.modal,
                  modalStyles.modalButtons,
                ]}
              />
              <div className={styles.datesContainer}>
                <div className={styles.dateWrapper}>
                  <span
                    className={`${styles.sprintDate} ${
                      isEditingName ? styles.editable : ''
                    }`}
                    onClick={() => handleDateClick('start')}
                  >
                    {new Date(sprint.start_date).toLocaleDateString()}
                    {isEditingName && (
                      <FaCalendar className={styles.calendarIcon} />
                    )}
                  </span>
                  {showDatePicker && dateType === 'start' && (
                    <div className={styles.datePickerWrapper}>
                      <DatePicker
                        selected={new Date(sprint.start_date)}
                        onChange={handleDateChange}
                        maxDate={new Date(sprint.end_date)}
                        inline
                        onClickOutside={() => {
                          setShowDatePicker(false);
                          setDateType(null);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.dateWrapper}> - </div>
                <div className={styles.dateWrapper}>
                  <span
                    className={`${styles.sprintDate} ${
                      isEditingName ? styles.editable : ''
                    }`}
                    onClick={() => handleDateClick('end')}
                  >
                    {new Date(sprint.end_date).toLocaleDateString()}
                    {isEditingName && (
                      <FaCalendar className={styles.calendarIcon} />
                    )}
                  </span>
                  {showDatePicker && dateType === 'end' && (
                    <div className={styles.datePickerWrapper}>
                      <DatePicker
                        selected={new Date(sprint.end_date)}
                        onChange={handleDateChange}
                        minDate={new Date(sprint.start_date)}
                        inline
                        onClickOutside={() => {
                          setShowDatePicker(false);
                          setDateType(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          className={styles.carouselButton}
          onClick={onNext}
          disabled={!sprint}
        >
          →
        </button>
      </div>

      <SprintControls
        sprint={sprint}
        onAddSprint={onAddSprint}
        isEditing={isEditingName}
        setIsEditing={setIsEditingName}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default SprintHeader;
