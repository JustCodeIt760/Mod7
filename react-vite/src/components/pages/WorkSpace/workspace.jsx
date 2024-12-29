import styles from './Workspace.module.css';

function Workspace() {
  return (
    <div className={styles.dashboardContainer}>
      <h1>WorkSpace</h1>
      <p>Welcome to your workspace! 🚀</p>
      <div className={styles.placeholderSection}>
        <h2>Coming Soon</h2>
        <ul>
          <li>Project Overview</li>
          <li>Recent Activity</li>
          <li>Team Updates</li>
        </ul>
      </div>
    </div>
  );
}

export default Workspace;