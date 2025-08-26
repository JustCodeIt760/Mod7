import React, { useMemo } from 'react';
import styles from './styles/ProjectVisualization.module.css';

function ProjectVisualization({ 
  project, 
  sprints = [], 
  features = [], 
  tasks = [],
  /* PMI Enhanced Data */
  budgets = [],
  earnedValueData = [],
  schedulePerformance = [],
  risks = [],
  workPackages = [],
  stakeholders = [],
  businessObjectives = []
}) {
  
  // Calculate comprehensive project health metrics using PMI standards
  const projectMetrics = useMemo(() => {
    const totalSprints = sprints.length;
    const now = new Date();
    
    // Sprint-based progress
    const activeSprints = sprints.filter(sprint => 
      sprint.start_date && sprint.end_date &&
      new Date(sprint.start_date) <= now &&
      now <= new Date(sprint.end_date)
    ).length;
    
    const completedSprints = sprints.filter(sprint => {
      const sprintFeatures = features.filter(f => f.sprint_id === sprint.id);
      return sprintFeatures.length > 0 && 
             sprintFeatures.every(f => f.status === 'Completed');
    }).length;

    const overallProgress = totalSprints > 0 ? 
      Math.round((completedSprints / totalSprints) * 100) : 0;

    const overdueTasksCount = tasks.filter(task => 
      task.status !== 'Completed' && 
      task.due_date && 
      new Date(task.due_date) < now
    ).length;

    // Enhanced Schedule Health using EVM data
    let scheduleHealth = 0;
    let costHealth = 0;
    let budgetVariance = 0;
    
    if (earnedValueData.length > 0) {
      const latestEVM = earnedValueData[earnedValueData.length - 1];
      const spi = latestEVM.schedule_performance_index || 1;
      const cpi = latestEVM.cost_performance_index || 1;
      
      // Convert SPI to percentage deviation from baseline
      scheduleHealth = Math.round((spi - 1) * 100);
      costHealth = Math.round((cpi - 1) * 100);
      
      // Budget variance as percentage
      if (latestEVM.budget_at_completion && latestEVM.estimate_at_completion) {
        budgetVariance = Math.round(
          ((latestEVM.budget_at_completion - latestEVM.estimate_at_completion) / 
           latestEVM.budget_at_completion) * 100
        );
      }
    } else {
      // Fallback calculation using basic sprint data
      scheduleHealth = totalSprints > 0 ? 
        Math.round(((completedSprints + activeSprints * 0.5) / totalSprints - 0.5) * 200) : 0;
    }

    // Risk Assessment
    const highRisks = risks.filter(risk => 
      risk.status === 'Active' && risk.risk_level === 'High'
    ).length;

    const mediumRisks = risks.filter(risk => 
      risk.status === 'Active' && risk.risk_level === 'Medium'
    ).length;

    // Business Objectives Progress
    const objectivesProgress = businessObjectives.length > 0 ? 
      Math.round(
        businessObjectives.reduce((sum, obj) => sum + (obj.progress_percentage || 0), 0) / 
        businessObjectives.length
      ) : 0;

    return {
      scheduleHealth,
      costHealth,
      budgetVariance,
      overallProgress,
      objectivesProgress,
      overdueTasksCount,
      highRisks,
      mediumRisks,
      totalActiveRisks: highRisks + mediumRisks
    };
  }, [sprints, features, tasks, earnedValueData, risks, businessObjectives]);

  // Enhanced sprint analysis with PMI work package integration
  const sprintAnalysis = useMemo(() => {
    return sprints.map(sprint => {
      const sprintFeatures = features.filter(f => f.sprint_id === sprint.id);
      const sprintTasks = tasks.filter(t => 
        sprintFeatures.some(f => f.id === t.feature_id)
      );
      
      // Find related work packages for this sprint
      const sprintWorkPackages = workPackages.filter(wp => 
        wp.planned_start && wp.planned_end &&
        sprint.start_date && sprint.end_date &&
        new Date(wp.planned_start) >= new Date(sprint.start_date) &&
        new Date(wp.planned_end) <= new Date(sprint.end_date)
      );

      // Calculate progress using multiple data sources
      const completedTasks = sprintTasks.filter(t => t.status === 'Completed');
      const taskProgress = sprintTasks.length > 0 ? 
        Math.round((completedTasks.length / sprintTasks.length) * 100) : 0;
      
      // Use work package progress if available
      const wpProgress = sprintWorkPackages.length > 0 ? 
        Math.round(
          sprintWorkPackages.reduce((sum, wp) => sum + (wp.progress_percentage || 0), 0) / 
          sprintWorkPackages.length
        ) : 0;
      
      // Use the higher of task-based or work-package based progress
      const progress = Math.max(taskProgress, wpProgress);
      
      // Enhanced capacity calculation using work packages
      const teamMembersCount = project.members?.length || 3;
      const sprintDuration = calculateSprintDuration(sprint);
      const totalCapacityHours = teamMembersCount * sprintDuration * 6; // 6 hours per day per person
      
      // Calculate effort from work packages (more accurate) or fallback to task estimate
      let estimatedEffort = 0;
      if (sprintWorkPackages.length > 0) {
        estimatedEffort = sprintWorkPackages.reduce((sum, wp) => sum + (wp.estimated_hours || 0), 0);
      } else {
        estimatedEffort = sprintTasks.length * 8; // 8 hours per task fallback
      }
      
      const utilization = totalCapacityHours > 0 ? 
        Math.min(Math.round((estimatedEffort / totalCapacityHours) * 100), 150) : 0; // Allow over 100%
      
      // Enhanced capacity status with work package insights
      let capacityStatus = 'normal';
      let capacityMessage = '✓ Can add features';
      
      if (utilization >= 120) {
        capacityStatus = 'critical';
        capacityMessage = '🚨 Severely overloaded';
      } else if (utilization >= 100) {
        capacityStatus = 'critical';
        capacityMessage = '⚠ Over capacity';
      } else if (utilization >= 85) {
        capacityStatus = 'warning';
        capacityMessage = '⚠ At capacity';
      } else if (utilization >= 70) {
        capacityStatus = 'moderate';
        capacityMessage = '◐ Moderate load';
      }
      
      // Enhanced critical path analysis using schedule performance
      const sprintSchedulePerf = schedulePerformance.find(sp => 
        sprintWorkPackages.some(wp => wp.id === sp.work_package_id)
      );
      
      const highPriorityFeatures = sprintFeatures.filter(f => f.priority >= 3);
      const isBehindSchedule = progress < 40 && sprintDuration > 0;
      const hasScheduleIssues = sprintSchedulePerf && 
        (sprintSchedulePerf.schedule_performance_index < 0.9 || 
         sprintSchedulePerf.finish_variance_days > 2);
      
      const isCritical = (isBehindSchedule && highPriorityFeatures.length > 0) || 
                        utilization > 100 || 
                        hasScheduleIssues;
      
      // Calculate actual vs planned cost if available
      let costVariance = 0;
      if (sprintWorkPackages.length > 0) {
        const totalPlannedCost = sprintWorkPackages.reduce((sum, wp) => sum + (wp.estimated_cost || 0), 0);
        const totalActualCost = sprintWorkPackages.reduce((sum, wp) => sum + (wp.actual_cost || 0), 0);
        if (totalPlannedCost > 0) {
          costVariance = Math.round(((totalActualCost - totalPlannedCost) / totalPlannedCost) * 100);
        }
      }
      
      return {
        ...sprint,
        sprintFeatures,
        sprintTasks,
        sprintWorkPackages,
        progress,
        utilization,
        capacityStatus,
        capacityMessage,
        isCritical,
        duration: sprintDuration,
        availableCapacity: Math.max(0, 100 - utilization),
        costVariance,
        schedulePerformance: sprintSchedulePerf,
        estimatedEffortHours: estimatedEffort,
        totalCapacityHours
      };
    });
  }, [sprints, features, tasks, workPackages, schedulePerformance, project.members]);

  // Parking lot intelligence
  const parkingLotAnalysis = useMemo(() => {
    const unassignedFeatures = features.filter(f => !f.sprint_id);
    
    // Find best sprint recommendations for unassigned features
    const recommendations = unassignedFeatures.map(feature => {
      // Find sprint with lowest utilization that can handle the feature
      const availableSprints = sprintAnalysis
        .filter(s => s.utilization < 90)
        .sort((a, b) => a.utilization - b.utilization);
      
      const recommendedSprint = availableSprints[0];
      
      return {
        ...feature,
        recommendedSprint: recommendedSprint ? {
          id: recommendedSprint.id,
          name: recommendedSprint.name,
          utilization: recommendedSprint.utilization
        } : null
      };
    });
    
    return {
      unassignedFeatures,
      recommendations,
      highPriorityCount: unassignedFeatures.filter(f => f.priority >= 3).length
    };
  }, [features, sprintAnalysis]);

  // Generate planning recommendations
  const planningRecommendations = useMemo(() => {
    const recommendations = [];
    
    const overloadedSprints = sprintAnalysis.filter(s => s.utilization > 90).length;
    const underutilizedSprints = sprintAnalysis.filter(s => s.utilization < 60).length;
    
    if (underutilizedSprints > 0) {
      recommendations.push({
        type: 'info',
        message: `Team has capacity for additional features in ${underutilizedSprints} sprint${underutilizedSprints > 1 ? 's' : ''}`
      });
    }
    
    if (overloadedSprints > 0) {
      recommendations.push({
        type: 'warning',
        message: `${overloadedSprints} sprint${overloadedSprints > 1 ? 's are' : ' is'} overloaded - consider balancing workload`
      });
    }
    
    if (parkingLotAnalysis.highPriorityCount > 0) {
      recommendations.push({
        type: 'urgent',
        message: `${parkingLotAnalysis.highPriorityCount} high-priority feature${parkingLotAnalysis.highPriorityCount > 1 ? 's' : ''} in parking lot need assignment`
      });
    }
    
    if (projectMetrics.overdueTasksCount > 0) {
      recommendations.push({
        type: 'urgent',
        message: `${projectMetrics.overdueTasksCount} overdue task${projectMetrics.overdueTasksCount > 1 ? 's' : ''} need immediate attention`
      });
    }
    
    return recommendations;
  }, [sprintAnalysis, parkingLotAnalysis, projectMetrics]);

  return (
    <div className={styles.projectVisualization || ''}>
      <div style={{ background: 'white', padding: '20px', margin: '20px 0', border: '1px solid #ddd' }}>
        <h3>Project Visualization Component Loaded</h3>
        <p>Sprints: {sprints.length}</p>
        <p>Features: {features.length}</p>
        <p>Tasks: {tasks.length}</p>
      </div>
      
      {/* PMI-Enhanced Project Health Dashboard */}
      <div className={styles.healthDashboard || ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '1rem' }}>
        <div className={styles.metricCard || ''} style={{ textAlign: 'center', padding: '1rem', borderRadius: '8px', background: '#fafbfc', border: '1px solid #e1e8ed' }}>
          <div className={styles.metricLabel || ''} style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500', marginBottom: '0.5rem' }}>Schedule Performance (SPI)</div>
          <div className={`${styles.metricValue || ''} ${
            projectMetrics.scheduleHealth >= 0 ? styles.positive || 'positive' : styles.negative || 'negative'
          }`} style={{ fontSize: '2rem', fontWeight: '700', color: projectMetrics.scheduleHealth >= 0 ? '#10b981' : '#ef4444' }}>
            {projectMetrics.scheduleHealth >= 0 ? '+' : ''}{projectMetrics.scheduleHealth}%
          </div>
          <div className={styles.metricSubtext || ''} style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            {projectMetrics.scheduleHealth > 5 ? 'Ahead of Schedule' : 
             projectMetrics.scheduleHealth < -5 ? 'Behind Schedule' : 'On Track'}
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Cost Performance (CPI)</div>
          <div className={`${styles.metricValue} ${
            projectMetrics.costHealth >= 0 ? styles.positive : styles.negative
          }`}>
            {projectMetrics.costHealth >= 0 ? '+' : ''}{projectMetrics.costHealth}%
          </div>
          <div className={styles.metricSubtext}>
            {projectMetrics.costHealth > 5 ? 'Under Budget' : 
             projectMetrics.costHealth < -5 ? 'Over Budget' : 'On Budget'}
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Business Objectives</div>
          <div className={`${styles.metricValue} ${styles.normal}`}>
            {projectMetrics.objectivesProgress}%
          </div>
          <div className={styles.metricSubtext}>
            Average completion
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active Risks</div>
          <div className={`${styles.metricValue} ${
            projectMetrics.totalActiveRisks > 5 ? styles.urgent : 
            projectMetrics.totalActiveRisks > 2 ? styles.moderate : styles.normal
          }`}>
            {projectMetrics.totalActiveRisks}
          </div>
          <div className={styles.metricSubtext}>
            {projectMetrics.highRisks} high, {projectMetrics.mediumRisks} medium
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Sprint Progress</div>
          <div className={styles.metricValue}>
            {projectMetrics.overallProgress}%
          </div>
          <div className={styles.metricSubtext}>
            Overall completion
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Overdue Tasks</div>
          <div className={`${styles.metricValue} ${
            projectMetrics.overdueTasksCount > 0 ? styles.urgent : styles.normal
          }`}>
            {projectMetrics.overdueTasksCount}
          </div>
          <div className={styles.metricSubtext}>
            Need attention
          </div>
        </div>
      </div>

      {/* Sprint Gantt Chart */}
      <div className={styles.ganttChart}>
        <div className={styles.ganttHeader}>
          <div className={styles.sprintInfo}>Sprint Info</div>
          <div className={styles.timeline}>Progress</div>
          <div className={styles.capacity}>Capacity</div>
          <div className={styles.intelligence}>Planning Status</div>
        </div>
        
        {sprintAnalysis.map(sprint => (
          <div 
            key={sprint.id} 
            className={`${styles.sprintRow} ${
              sprint.isCritical ? styles.criticalPath : ''
            }`}
          >
            <div className={styles.sprintInfo}>
              <div className={styles.sprintName}>
                {sprint.name}
                {sprint.isCritical && (
                  <span className={styles.criticalBadge}>CRITICAL</span>
                )}
              </div>
              <div className={styles.sprintDates}>
                {formatDateRange(sprint.start_date, sprint.end_date)}
              </div>
              <div className={styles.sprintDuration}>
                {sprint.duration} days
              </div>
            </div>
            
            <div className={styles.timeline}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${sprint.progress}%` }}
                />
                <span className={styles.progressText}>
                  {sprint.progress}%
                </span>
              </div>
            </div>
            
            <div className={styles.capacity}>
              <div className={`${styles.capacityBar} ${styles[sprint.capacityStatus]}`}>
                <div 
                  className={styles.capacityFill}
                  style={{ width: `${sprint.utilization}%` }}
                />
                <span className={styles.capacityText}>
                  {sprint.utilization}%
                </span>
              </div>
            </div>
            
            <div className={styles.intelligence}>
              <div className={`${styles.statusMessage} ${styles[sprint.capacityStatus]}`}>
                {sprint.capacityMessage}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Parking Lot Intelligence */}
      {parkingLotAnalysis.unassignedFeatures.length > 0 && (
        <div className={styles.parkingLotIntelligence}>
          <h3>Parking Lot Recommendations</h3>
          <div className={styles.recommendationsList}>
            {parkingLotAnalysis.recommendations.map(rec => (
              <div key={rec.id} className={styles.recommendationItem}>
                <div className={styles.featureName}>
                  <span className={`${styles.priorityBadge} ${styles[`priority${rec.priority}`]}`}>
                    P{rec.priority}
                  </span>
                  {rec.name}
                </div>
                <div className={styles.recommendation}>
                  {rec.recommendedSprint ? (
                    <span className={styles.sprintRecommendation}>
                      → Recommended: {rec.recommendedSprint.name} 
                      ({rec.recommendedSprint.utilization}% used)
                    </span>
                  ) : (
                    <span className={styles.noRecommendation}>
                      No available capacity
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planning Recommendations */}
      {planningRecommendations.length > 0 && (
        <div className={styles.planningRecommendations}>
          <h3>Planning Insights</h3>
          <div className={styles.recommendationsList}>
            {planningRecommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`${styles.recommendationItem} ${styles[rec.type]}`}
              >
                <div className={styles.recommendationIcon}>
                  {rec.type === 'info' && 'ℹ️'}
                  {rec.type === 'warning' && '⚠️'}
                  {rec.type === 'urgent' && '🚨'}
                </div>
                <div className={styles.recommendationText}>
                  {rec.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function calculateSprintDuration(sprint) {
  if (!sprint.start_date || !sprint.end_date) return 0;
  
  const start = new Date(sprint.start_date);
  const end = new Date(sprint.end_date);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'No dates set';
  
  const start = new Date(startDate).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  const end = new Date(endDate).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${start} - ${end}`;
}

export default ProjectVisualization;