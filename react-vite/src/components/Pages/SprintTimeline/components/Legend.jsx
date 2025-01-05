import { useSelector } from 'react-redux';
import styles from '../styles/SprintTimeline.module.css';

const Legend = () => {
  const teamMembers = useSelector((state) => state.users.allUsers);

  return (
    <div className={styles.legend}>
      <h4>Team Members</h4>
      {Object.values(teamMembers).map((member) => (
        <div key={member.id} className={styles.legendItem}>
          <div
            className={styles.colorBox}
            style={{ backgroundColor: getTeamMemberColor(member.id) }}
          />
          <span>{member.username}</span>
        </div>
      ))}
    </div>
  );
};
export default Legend;
