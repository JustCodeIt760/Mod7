import { useState, useEffect } from 'react';
import styles from './ProjectDataViewer.module.css';

function ProjectDataViewer({ visible = false, onToggle }) {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    stakeholders: true,
    risks: true,
    workPackages: true,
    businessObjectives: true
  });

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat/project-data', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjectData(data);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadProjectData();
    }
  }, [visible]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!visible) return null;

  return (
    <div className={styles.viewer}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📊</span>
          <span>Project Data</span>
        </div>
        <div className={styles.actions}>
          <button onClick={loadProjectData} className={styles.refreshBtn} disabled={loading}>
            {loading ? '⟳' : '↻'}
          </button>
          <button onClick={onToggle} className={styles.closeBtn}>×</button>
        </div>
      </div>

      <div className={styles.content}>
        {loading && (
          <div className={styles.loading}>Loading project data...</div>
        )}

        {projectData && !projectData.project && (
          <div className={styles.noProject}>
            <div className={styles.emptyIcon}>📁</div>
            <div>No active project found</div>
            <div className={styles.emptyHint}>Start a conversation to create a project</div>
          </div>
        )}

        {projectData?.project && (
          <div className={styles.projectData}>
            {/* Project Overview */}
            <FileSection
              title="📋 Project Charter"
              isExpanded={expandedSections.overview}
              onToggle={() => toggleSection('overview')}
            >
              <div className={styles.fileContent}>
                <div className={styles.field}>
                  <span className={styles.fieldName}>Name:</span>
                  <span className={styles.fieldValue}>{projectData.project.name}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldName}>Description:</span>
                  <span className={styles.fieldValue}>{projectData.project.description}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldName}>Status:</span>
                  <span className={styles.fieldValue}>{projectData.project.status}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldName}>Due Date:</span>
                  <span className={styles.fieldValue}>{formatDate(projectData.project.due_date)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldName}>Created:</span>
                  <span className={styles.fieldValue}>{formatDate(projectData.project.created_at)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldName}>Last Updated:</span>
                  <span className={styles.fieldValue}>{formatDate(projectData.project.updated_at)}</span>
                </div>
              </div>
            </FileSection>

            {/* Stakeholders */}
            <FileSection
              title={`👥 Stakeholders (${projectData.summary.stakeholder_count})`}
              isExpanded={expandedSections.stakeholders}
              onToggle={() => toggleSection('stakeholders')}
            >
              <div className={styles.fileContent}>
                {projectData.stakeholders.length === 0 ? (
                  <div className={styles.emptySection}>No stakeholders defined</div>
                ) : (
                  projectData.stakeholders.map((stakeholder, index) => (
                    <div key={stakeholder.id} className={styles.listItem}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemName}>{stakeholder.name}</span>
                        <span className={styles.itemRole}>({stakeholder.role})</span>
                      </div>
                      <div className={styles.itemDetails}>
                        <span>Power: {stakeholder.power_level}</span>
                        <span>Interest: {stakeholder.interest_level}</span>
                        <span>Strategy: {stakeholder.influence_strategy}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FileSection>

            {/* Risks */}
            <FileSection
              title={`⚠️ Risk Log (${projectData.summary.risk_count})`}
              isExpanded={expandedSections.risks}
              onToggle={() => toggleSection('risks')}
            >
              <div className={styles.fileContent}>
                {projectData.risks.length === 0 ? (
                  <div className={styles.emptySection}>No risks logged</div>
                ) : (
                  projectData.risks.map((risk, index) => (
                    <div key={risk.id} className={styles.listItem}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemName}>{risk.title}</span>
                        <span className={`${styles.riskLevel} ${styles[risk.risk_level?.toLowerCase()]}`}>
                          {risk.risk_level}
                        </span>
                      </div>
                      <div className={styles.itemDescription}>{risk.description}</div>
                      <div className={styles.itemDetails}>
                        <span>Category: {risk.category}</span>
                        <span>Status: {risk.status}</span>
                        <span>Probability: {Math.round((risk.probability || 0) * 100)}%</span>
                        <span>Impact: {Math.round((risk.impact || 0) * 100)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FileSection>

            {/* Work Packages */}
            <FileSection
              title={`🔨 Work Packages (${projectData.summary.work_package_count})`}
              isExpanded={expandedSections.workPackages}
              onToggle={() => toggleSection('workPackages')}
            >
              <div className={styles.fileContent}>
                {projectData.work_packages.length === 0 ? (
                  <div className={styles.emptySection}>No work packages defined</div>
                ) : (
                  projectData.work_packages.map((wp, index) => (
                    <div key={wp.id} className={styles.listItem}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemName}>{wp.name}</span>
                        <span className={`${styles.status} ${styles[wp.status?.toLowerCase().replace(' ', '')]}`}>
                          {wp.status}
                        </span>
                      </div>
                      <div className={styles.itemDescription}>{wp.description}</div>
                      <div className={styles.itemDetails}>
                        <span>Type: {wp.work_type}</span>
                        <span>Estimated Hours: {wp.estimated_hours || 'Not set'}</span>
                        <span>Progress: {wp.progress_percentage || 0}%</span>
                        <span>Start: {formatDate(wp.planned_start)}</span>
                        <span>End: {formatDate(wp.planned_end)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FileSection>

            {/* Business Objectives */}
            <FileSection
              title={`🎯 Business Objectives (${projectData.summary.business_objective_count})`}
              isExpanded={expandedSections.businessObjectives}
              onToggle={() => toggleSection('businessObjectives')}
            >
              <div className={styles.fileContent}>
                {projectData.business_objectives.length === 0 ? (
                  <div className={styles.emptySection}>No business objectives defined</div>
                ) : (
                  projectData.business_objectives.map((obj, index) => (
                    <div key={obj.id} className={styles.listItem}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemName}>{obj.title}</span>
                        <span className={`${styles.status} ${styles[obj.status?.toLowerCase().replace(' ', '')]}`}>
                          {obj.status}
                        </span>
                      </div>
                      <div className={styles.itemDescription}>{obj.description}</div>
                    </div>
                  ))
                )}
              </div>
            </FileSection>
          </div>
        )}
      </div>
    </div>
  );
}

function FileSection({ title, children, isExpanded, onToggle }) {
  return (
    <div className={styles.fileSection}>
      <div className={styles.sectionHeader} onClick={onToggle}>
        <span className={styles.expandIcon}>
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      {isExpanded && (
        <div className={styles.sectionContent}>
          {children}
        </div>
      )}
    </div>
  );
}

export default ProjectDataViewer;