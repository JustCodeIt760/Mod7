import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLoadProjects } from '../../../redux/project';
import styles from './ProjectsPage.module.css';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const projects = useSelector(state => Object.values(state.projects.allProjects));
  const isLoading = useSelector(state => state.projects.isLoading);

  useEffect(() => {
    dispatch(thunkLoadProjects());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={styles.projectsPage}>
      <header className={styles.header}>
        <h1>Projects</h1>
        <button className={styles.createButton}>Create Project</button>
      </header>

      <div className={styles.projectGrid}>
        {projects.map(project => (
          <div
            key={project.id}
            className={styles.projectCard}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className={styles.projectMeta}>
              <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
              <span>Features: {project.features?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;