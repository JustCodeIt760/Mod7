import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './SideNav.module.css';

const SideNav = () => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  const projects = useSelector((state) => state.projects?.allProjects || {});

  return (
    <nav className={styles.sideNav}>
      <div className={styles.navLinks}>
        <NavLink to="/projects" className={styles.navItem}>
          Home
        </NavLink>
        <NavLink to="/projects" className={styles.navItem}>
          WorkSpace
        </NavLink>
        <NavLink to="/sprints" className={styles.navItem}>
          Sprints
        </NavLink>

        <div className={styles.projectsSection}>
          <div
            className={styles.projectsHeader}
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          >
            <span>Projects</span>
            <span className={styles.arrow}>{isProjectsOpen ? '▼' : '▶'}</span>
          </div>

          {isProjectsOpen && (
            <div className={styles.projectsList}>
              {Object.values(projects).map((project) => (
                <NavLink
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={styles.projectItem}
                >
                  {project.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SideNav;
