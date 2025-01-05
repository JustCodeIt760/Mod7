// components/TimelineGrid.jsx
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { eachDayOfInterval, format, parseISO, isSameDay } from 'date-fns';
import TaskBar from './TaskBar';
import styles from '../styles/SprintTimeline.module.css';

const TimelineGrid = ({
  sprint,
  onTaskSelect,
  onTaskHover,
  users,
  projectId,
}) => {
  const tasks = useSelector((state) => state.tasks.allTasks);
  const features = useSelector((state) => state.features.allFeatures);
  const currentUser = useSelector((state) => state.session.user);

  // Generate array of days between sprint start and end
  const days = useMemo(() => {
    if (!sprint?.start_date || !sprint?.end_date) return [];
    return eachDayOfInterval({
      start: parseISO(sprint.start_date),
      end: parseISO(sprint.end_date),
    });
  }, [sprint]);

  // Filter and sort tasks
  const { userTasks, teamTasks } = useMemo(() => {
    if (!tasks || !features || !sprint) {
      return { userTasks: [], teamTasks: [] };
    }

    const sprintTasks = Object.values(tasks).filter((task) => {
      const feature = features[task?.feature_id];
      return feature && feature.sprint_id === parseInt(sprint.id);
    });

    return sprintTasks.reduce(
      (acc, task) => {
        if (task?.assigned_to === currentUser?.id) {
          acc.userTasks.push(task);
        } else {
          acc.teamTasks.push(task);
        }
        return acc;
      },
      { userTasks: [], teamTasks: [] }
    );
  }, [tasks, features, sprint, currentUser]);

  if (!sprint || !days.length) {
    return null;
  }

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineContent}>
        <div
          className={styles.timelineHeader}
          style={{ '--total-days': days.length }}
        >
          {days.map((day) => (
            <div key={day.toISOString()} className={styles.dateHeader}>
              {format(day, 'MMM d')}
            </div>
          ))}
        </div>

        <div className={styles.timelineBody}>
          <div
            className={styles.gridLines}
            style={{ '--total-days': days.length }}
          >
            {days.map((day) => (
              <div key={day.toISOString()} className={styles.gridColumn} />
            ))}
          </div>

          <div className={styles.tasksSectionsContainer}>
            {userTasks.length > 0 && (
              <div className={styles.tasksSectionWrapper}>
                <div className={styles.sectionHeader}>Your Tasks</div>
                <div
                  className={styles.tasksSection}
                  style={{ '--task-count': userTasks.length }}
                >
                  {userTasks.map((task, index) => (
                    <TaskBar
                      key={task.id}
                      task={task}
                      days={days}
                      index={index}
                      isUserTask={true}
                      onSelect={onTaskSelect}
                      onHover={onTaskHover}
                      users={users}
                    />
                  ))}
                </div>
              </div>
            )}

            {teamTasks.length > 0 && (
              <div className={styles.tasksSectionWrapper}>
                <div className={styles.sectionHeader}>Team Tasks</div>
                <div
                  className={styles.tasksSection}
                  style={{ '--task-count': teamTasks.length }}
                >
                  {teamTasks.map((task, index) => (
                    <TaskBar
                      key={task.id}
                      task={task}
                      days={days}
                      index={index}
                      isUserTask={false}
                      onSelect={onTaskSelect}
                      onHover={onTaskHover}
                      users={users}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineGrid;
