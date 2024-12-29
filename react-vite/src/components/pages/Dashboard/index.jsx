import styles from './Dashboard.module.css';

function Dashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard</h1>
      <p>Welcome to your project dashboard! 🚀</p>
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

export default Dashboard;
