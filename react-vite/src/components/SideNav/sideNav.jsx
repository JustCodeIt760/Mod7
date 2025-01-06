import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './SideNav.module.css';
import {
  selectMemberProjects,
  selectOwnedProjects,
  thunkLoadProjects,
} from '../../redux/project';
import { selectUser } from '../../redux/session';

const SideNav = () => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const ownedProjects = useSelector(selectOwnedProjects(user.id));
  const memberProjects = useSelector(selectMemberProjects(user.id));
  const projects = useSelector((state) => state.projects.allProjects);

  useEffect(() => {
    if (user) {
      dispatch(thunkLoadProjects());
    }
  }, [dispatch, user, Object.keys(projects).length]);

  return (
    <nav className={styles.sideNav}>
      <div className={styles.navLinks}>
        <NavLink to="/" className={styles.navItem}>
          WorkSpace
        </NavLink>
        <NavLink to="/tasks" className={styles.navItem}>
          Tasks
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
              {memberProjects.map((project) => (
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
