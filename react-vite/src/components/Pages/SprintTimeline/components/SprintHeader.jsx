// components/SprintHeader.jsx
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectProjectPageData } from '../../../../redux/project';
import styles from '../styles/SprintTimeline.module.css';

const SprintHeader = ({ projectId, sprint }) => {
  const navigate = useNavigate();
  const projectData = useSelector((state) =>
    selectProjectPageData(state, projectId)
  );

  if (!projectData) return null;

  const { project } = projectData;

  return (
    <div className={styles.header}>
      <button
        className={styles.backButton}
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        ← Back to Project
      </button>
      <div className={styles.headerContent}>
        <div className={styles.projectInfo}>
          <h1>{project.name}</h1>
        </div>
        {sprint && (
          <div className={styles.sprintInfo}>
            <h2>{sprint.name}</h2>
            <span className={styles.sprintDates}>
              {format(new Date(sprint.start_date), 'MMM d, yyyy')} -{' '}
              {format(new Date(sprint.end_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintHeader;
