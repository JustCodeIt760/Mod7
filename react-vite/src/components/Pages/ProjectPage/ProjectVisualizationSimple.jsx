import React from 'react';

function ProjectVisualizationSimple({ project, sprints = [], features = [], tasks = [] }) {
  console.log('ProjectVisualization rendering with:', { project: project?.name, sprints: sprints.length, features: features.length, tasks: tasks.length });
  
  return (
    <div style={{ 
      background: 'white', 
      padding: '2rem', 
      margin: '2rem 0', 
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e1e8ed'
    }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Project Command Center</h2>
      
      {/* Health Dashboard */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem', 
          borderRadius: '8px', 
          background: '#fafbfc', 
          border: '1px solid #e1e8ed' 
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Sprints</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{sprints.length}</div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem', 
          borderRadius: '8px', 
          background: '#fafbfc', 
          border: '1px solid #e1e8ed' 
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Features</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{features.length}</div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem', 
          borderRadius: '8px', 
          background: '#fafbfc', 
          border: '1px solid #e1e8ed' 
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Tasks</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{tasks.length}</div>
        </div>
      </div>
      
      {/* Sprint List */}
      {sprints.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>Sprint Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sprints.map(sprint => (
              <div key={sprint.id} style={{ 
                padding: '1rem', 
                border: '1px solid #e1e8ed', 
                borderRadius: '8px',
                background: '#fafbfc'
              }}>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{sprint.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {sprint.start_date && sprint.end_date ? 
                    `${new Date(sprint.start_date).toLocaleDateString()} - ${new Date(sprint.end_date).toLocaleDateString()}` :
                    'Dates not set'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectVisualizationSimple;