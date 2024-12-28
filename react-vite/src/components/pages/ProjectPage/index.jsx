import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkSetProject } from '../../../redux/project';
import FeatureList from '../../features/FeatureList';
import SideNav from '../../SideNav';
import styles from './ProjectPage.module.css';

const ProjectPage = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const project = useSelector(state => state.projects.singleProject);
  const isLoading = useSelector(state => state.projects.isLoading);

  useEffect(() => {
    dispatch(thunkSetProject(projectId));
  }, [dispatch, projectId]);

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className={styles.projectPage}>
      <SideNav />

      <main className={styles.mainContent}>
        <header className={styles.projectHeader}>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <div className={styles.projectMeta}>
            <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
            <span>Owner: {project.owner?.username}</span>
          </div>
        </header>

        <div className={styles.featuresContainer}>
          <FeatureList projectId={projectId} />
        </div>
      </main>

      <div className={styles.sprintSection}>
        {/* Sprint section will be implemented later */}
      </div>
    </div>
  );
};

export default ProjectPage; 