import React from 'react';
import styles from './ProjectStatusCard.module.css';

const ProjectStatusCard = ({ project }) => {
  if (!project) return null;

  const progressPercentage = project.progress || 10;
  const phase = project.phase || 'Planning';

  return (
    <div className={styles.statusCard}>
      <div className={styles.header}>
        <span className={styles.projectIcon}>🏥</span>
        <div className={styles.projectInfo}>
          <h3 className={styles.projectName}>{project.name}</h3>
          <p className={styles.projectOrg}>{project.organization}</p>
        </div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusLabel}>STATUS: {project.status || 'Initiated'}</div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          >
            <span className={styles.progressText}>{progressPercentage}% {phase}</span>
          </div>
        </div>
      </div>

      <div className={styles.generatedSection}>
        <h4 className={styles.sectionTitle}>📋 Auto-Generated:</h4>
        <ul className={styles.generatedList}>
          {project.artifacts?.map((artifact, index) => (
            <li key={index} className={styles.artifactItem}>
              <span className={styles.artifactStatus}>
                {artifact.status === 'complete' ? '✓' : '•'}
              </span>
              {artifact.name}
            </li>
          )) || (
            <>
              <li className={styles.artifactItem}>
                <span className={styles.artifactStatus}>•</span>
                Project Charter (Draft)
              </li>
              <li className={styles.artifactItem}>
                <span className={styles.artifactStatus}>•</span>
                {project.stakeholderCount || 12} Stakeholders identified
              </li>
              <li className={styles.artifactItem}>
                <span className={styles.artifactStatus}>•</span>
                {project.riskCount || 6} Initial risks logged
              </li>
              <li className={styles.artifactItem}>
                <span className={styles.artifactStatus}>•</span>
                {project.phaseCount || 4}-phase WBS created
              </li>
            </>
          )}
        </ul>
      </div>

      <div className={styles.actionsSection}>
        <h4 className={styles.sectionTitle}>⚡ Next Actions:</h4>
        <ul className={styles.actionsList}>
          {project.nextActions?.map((action, index) => (
            <li key={index} className={styles.actionItem}>
              <span className={styles.actionBullet}>→</span>
              {action}
            </li>
          )) || (
            <>
              <li className={styles.actionItem}>
                <span className={styles.actionBullet}>→</span>
                Review stakeholder list
              </li>
              <li className={styles.actionItem}>
                <span className={styles.actionBullet}>→</span>
                Approve project charter
              </li>
              <li className={styles.actionItem}>
                <span className={styles.actionBullet}>→</span>
                Schedule kickoff meeting
              </li>
            </>
          )}
        </ul>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.primaryButton}>Open Dashboard</button>
        <button className={styles.secondaryButton}>Quick Edit</button>
      </div>
    </div>
  );
};

export default ProjectStatusCard;