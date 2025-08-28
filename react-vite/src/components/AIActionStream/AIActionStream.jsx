import React, { useState, useEffect } from 'react';
import styles from './AIActionStream.module.css';

const AIActionStream = ({ actions, isProcessing }) => {
  const [visibleActions, setVisibleActions] = useState([]);

  useEffect(() => {
    if (actions && actions.length > 0) {
      // Animate actions appearing one by one
      actions.forEach((action, index) => {
        setTimeout(() => {
          setVisibleActions(prev => [...prev, action]);
        }, index * 500);
      });
    }
  }, [actions]);

  const getActionIcon = (type) => {
    switch(type) {
      case 'analyzing': return '🔍';
      case 'creating': return '✨';
      case 'identifying': return '👥';
      case 'generating': return '📊';
      case 'mapping': return '🗺️';
      case 'assessing': return '⚠️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⚡';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'var(--success-color, #10b981)';
      case 'in_progress': return 'var(--warning-color, #f59e0b)';
      case 'error': return 'var(--error-color, #ef4444)';
      default: return 'var(--text-secondary, #6b7280)';
    }
  };

  return (
    <div className={styles.actionStream}>
      <div className={styles.header}>
        <span className={styles.aiIcon}>🤖</span>
        <span className={styles.title}>
          {isProcessing ? 'AI Assistant Working...' : 'AI Assistant Actions'}
        </span>
        {isProcessing && <span className={styles.spinner}></span>}
      </div>
      
      <div className={styles.actionList}>
        {visibleActions.map((action, index) => (
          <div 
            key={index} 
            className={`${styles.actionItem} ${styles[`status-${action.status}`]}`}
            style={{
              animationDelay: `${index * 0.1}s`,
              borderLeftColor: getStatusColor(action.status)
            }}
          >
            <span className={styles.actionIcon}>
              {getActionIcon(action.type)}
            </span>
            <div className={styles.actionContent}>
              <div className={styles.actionTitle}>
                {action.title}
                {action.duration && (
                  <span className={styles.duration}>({action.duration})</span>
                )}
              </div>
              
              {action.details && action.details.length > 0 && (
                <div className={styles.actionDetails}>
                  {action.details.map((detail, idx) => (
                    <div key={idx} className={styles.detailItem}>
                      <span className={styles.detailIcon}>├─</span>
                      {detail.completed && <span className={styles.checkmark}>✓</span>}
                      <span className={styles.detailText}>{detail.text}</span>
                      {detail.count && (
                        <span className={styles.detailCount}>({detail.count})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {action.status === 'completed' && (
              <span className={styles.statusIcon}>✅</span>
            )}
            {action.status === 'in_progress' && (
              <span className={styles.statusIcon}>⏳</span>
            )}
          </div>
        ))}
      </div>

      {visibleActions.length > 0 && 
       visibleActions[visibleActions.length - 1]?.status === 'completed' && (
        <div className={styles.summary}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryIcon}>✅</span>
            <span>Project ready</span>
            <span className={styles.summaryTime}>
              ({visibleActions[visibleActions.length - 1]?.totalDuration || '5s'})
            </span>
          </div>
          <div className={styles.summaryActions}>
            <button className={styles.actionButton}>View Project Dashboard</button>
            <button className={styles.actionButtonSecondary}>See Details</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIActionStream;