import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './SideNav.module.css';

const SideNav = () => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const projects = useSelector(state => state.projects?.allProjects || {});

  // Filter projects based on ownership
  const ownedProjects = Object.values(projects).filter((project) => project.isOwned);
  const sharedProjects = Object.values(projects).filter((project) => !project.isOwned);

  return (
    <nav className={styles.sideNav}>
      <div className={styles.navLinks}>
        <NavLink to="/" className={styles.navItem}>WorkSpace</NavLink>
        <NavLink to="/workspace" className={styles.navItem}>Tasks</NavLink>
        <NavLink to="/sprints" className={styles.navItem}>Sprints</NavLink>
        
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
              <div className={styles.projectsCategoryHeader}>Owned</div>
              {ownedProjects.map((project) => (
                <NavLink 
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={styles.projectItem}
                >
                  {project.name}
                </NavLink>
              ))}
              
              <div className={styles.projectsCategoryHeader}>Shared</div>
              {sharedProjects.map((project) => (
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
