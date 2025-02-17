import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import { FaPencilAlt, FaTimes, FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EditableField from '../../utils/EditableField';
import ConfirmationModal from '../../utils/ConfirmationModal';
import modalStyles from '../../utils/styles/ConfirmationModal.module.css';
import {
  thunkUpdateTaskName,
  thunkUpdateTaskDescription,
  thunkRemoveTask,
  thunkUpdateTask,
} from '../../../redux/task';
import styles from './TaskItemContent.module.css';

function TaskItemContent({
  task,
  projectId,
  featureId,
  onToggleCompletion,
  status = false,
  showAssignment = false,
  editable = false,
  isEditing,
  setIsEditing,
}) {
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState(null);
  const [datePickerPosition, setDatePickerPosition] = useState({ x: 0, y: 0 });
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const users = useSelector((state) =>
    Object.values(state.users.allUsers || {})
  );

  const handleSaveName = async (newName) => {
    const result = await dispatch(
      thunkUpdateTaskName(projectId, featureId, task.id, newName)
    );
    if (result) {
      setIsEditing(false);
      setTaskBeingEdited(null);
    }
  };

  const handleSaveDescription = async (newDescription) => {
    const result = await dispatch(
      thunkUpdateTaskDescription(projectId, featureId, task.id, newDescription)
    );
    if (result) {
      setIsEditing(false);
      setTaskBeingEdited(null);
    }
  };

  const handleDateClick = (type, event) => {
    if (isEditing) {
      setDateType(type);
      setShowDatePicker(true);
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();

      // Calculate position to avoid overflow
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Default position below the clicked element
      let y = rect.bottom + window.scrollY;
      let x = rect.left;

      // Check if DatePicker would overflow bottom of viewport
      const datePickerHeight = 300; // Approximate height of DatePicker
      if (y + datePickerHeight > viewportHeight) {
        // Position above the clicked element if it would overflow bottom
        y = rect.top - datePickerHeight + window.scrollY;
      }

      // Check if DatePicker would overflow right of viewport
      const datePickerWidth = 300; // Approximate width of DatePicker
      if (x + datePickerWidth > viewportWidth) {
        x = viewportWidth - datePickerWidth - 10; // 10px padding from viewport edge
      }

      setDatePickerPosition({ x, y });
    }
  };

  const handleDateChange = async (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      console.error('Invalid date');
      return;
    }

    const formattedDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();

    const updates = {
      [dateType === 'start' ? 'start_date' : 'due_date']: formattedDate,
    };

    const result = await dispatch(
      thunkUpdateTask(projectId, featureId, task.id, updates)
    );
    if (result) {
      setShowDatePicker(false);
      setDateType(null);
    }
  };

  const handleAssigneeChange = async (userId) => {
    const result = await dispatch(
      thunkUpdateTask(projectId, featureId, task.id, {
        assigned_to: userId || null,
      })
    );
  };

  const handlePriorityChange = async (priority) => {
    const result = await dispatch(
      thunkUpdateTask(projectId, featureId, task.id, {
        priority: Number(priority),
      })
    );
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setIsEditing(false);
    setTaskBeingEdited(null);
  };

  return (
    <div className={styles.taskContainer}>
      <div className={styles.taskHeader}>
        <div className={styles.titleSection}>
          <button
            onClick={onToggleCompletion}
            className={`${styles.checkButton} ${
              task.status === 'Completed' ? styles.completed : ''
            }`}
            aria-label={
              task.status === 'Completed'
                ? 'Mark as incomplete'
                : 'Mark as complete'
            }
          >
            {task.status === 'Completed' ? '✓' : ''}
          </button>
          <EditableField
            value={task.name}
            onSave={handleSaveName}
            isEditing={isEditing && taskBeingEdited === task.id}
            setIsEditing={setIsEditing}
            className={`${styles.taskName} ${
              task.status === 'Completed' ? styles.completedText : ''
            }`}
            containerClassName={styles.taskContainer}
            excludeClassNames={[styles.editIcon, styles.deleteIcon]}
          />
        </div>
        {editable && (
          <div className={styles.taskControls}>
            <FaPencilAlt
              className={styles.editIcon}
              onClick={() => {
                setTaskBeingEdited(task.id);
                setIsEditing(!isEditing);
              }}
            />
            {isEditing && taskBeingEdited === task.id && (
              <FaTimes
                className={styles.deleteIcon}
                onClick={() => setShowDeleteModal(true)}
              />
            )}
          </div>
        )}
      </div>

      <EditableField
        value={task.description}
        onSave={handleSaveDescription}
        isEditing={isEditing && taskBeingEdited === task.id}
        setIsEditing={setIsEditing}
        className={styles.description}
        containerClassName={styles.taskContainer}
        excludeClassNames={[styles.editIcon, styles.deleteIcon]}
      />

      {showAssignment && (
        <div className={styles.assignmentInfo}>
          <span className={styles.assignedLabel}>Assigned to:</span>
          {isEditing && taskBeingEdited === task.id ? (
            <select
              value={task.assigned_to || ''}
              onChange={(e) => handleAssigneeChange(e.target.value || null)}
              className={styles.assigneeSelect}
            >
              <option value="">Unassigned</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.username}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={`${styles.assignedValue} ${
                isEditing && taskBeingEdited === task.id ? styles.editable : ''
              }`}
            >
              {task.display.assignedTo || 'Unassigned'}
            </span>
          )}
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.dates}>
          <div className={styles.dateItem}>
            <span className={styles.label}>Start:</span>
            <div className={styles.dateWrapper}>
              <span
                className={`${styles.value} ${
                  isEditing && taskBeingEdited === task.id
                    ? styles.editable
                    : ''
                }`}
                onClick={(e) => handleDateClick('start', e)}
              >
                {task.display.startDate}
                {isEditing && taskBeingEdited === task.id && (
                  <FaCalendar className={styles.calendarIcon} />
                )}
              </span>
              {showDatePicker &&
                dateType === 'start' &&
                ReactDOM.createPortal(
                  <div
                    className={styles.datePickerWrapper}
                    style={{
                      position: 'absolute',
                      left: `${datePickerPosition.x}px`,
                      top: `${datePickerPosition.y}px`,
                      zIndex: 1000,
                    }}
                  >
                    <DatePicker
                      selected={new Date(task.start_date)}
                      onChange={handleDateChange}
                      maxDate={new Date(task.due_date)}
                      inline
                      onClickOutside={() => {
                        setShowDatePicker(false);
                        setDateType(null);
                      }}
                    />
                  </div>,
                  document.body
                )}
            </div>
            <span className={styles.label}>Due:</span>
            <div className={styles.dateWrapper}>
              <span
                className={`${styles.value} ${
                  isEditing && taskBeingEdited === task.id
                    ? styles.editable
                    : ''
                }`}
                onClick={(e) => handleDateClick('end', e)}
              >
                {task.display.dueDate}
                {isEditing && taskBeingEdited === task.id && (
                  <FaCalendar className={styles.calendarIcon} />
                )}
              </span>
              {showDatePicker &&
                dateType === 'end' &&
                ReactDOM.createPortal(
                  <div
                    className={styles.datePickerWrapper}
                    style={{
                      position: 'absolute',
                      left: `${datePickerPosition.x}px`,
                      top: `${datePickerPosition.y}px`,
                      zIndex: 1000,
                    }}
                  >
                    <DatePicker
                      selected={new Date(task.due_date)}
                      onChange={handleDateChange}
                      minDate={new Date(task.start_date)}
                      inline
                      onClickOutside={() => {
                        setShowDatePicker(false);
                        setDateType(null);
                      }}
                    />
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </div>
        {isEditing && taskBeingEdited === task.id ? (
          <select
            value={task.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className={styles.prioritySelect}
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
        ) : (
          <span
            className={`${styles.priority} ${
              styles[`priority${task.display.priority}`]
            }`}
          >
            {task.display.priority}
          </span>
        )}
        {status && (
          <span
            className={`${styles.status} ${
              styles[task.status.replace(/\s+/g, '')]
            }`}
          >
            {task.status}
          </span>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        itemType="task"
        itemId={task.id}
        itemName={task.name}
        deleteFunction={(taskId) =>
          thunkRemoveTask(projectId, featureId, taskId)
        }
        modalClasses={[
          modalStyles.modalOverlay,
          modalStyles.modal,
          modalStyles.modalButtons,
        ]}
      />
    </div>
  );
}

export default TaskItemContent;
