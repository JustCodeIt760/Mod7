import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAgent } from '../../context/AgentContext';
import { thunkLogout } from '../../redux/session';
import AIActionStream from '../AIActionStream/AIActionStream';
import ProjectStatusCard from '../ProjectStatusCard/ProjectStatusCard';
import ProjectDataViewer from '../ProjectDataViewer/ProjectDataViewer';
import styles from './SuperUserAgent.module.css';

function SuperUserAgent({ projectData = null, visible = true }) {
  const dispatch = useDispatch();
  const {
    state,
    addMessage,
    updateMemory,
    processCommand,
    setContext
  } = useAgent();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentActions, setCurrentActions] = useState(null);
  const [currentProjectStatus, setCurrentProjectStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProjectData, setShowProjectData] = useState(false);
  const messagesEndRef = useRef(null);

  // Handle data toggle event from quick commands
  useEffect(() => {
    const handleDataToggle = () => setShowProjectData(prev => !prev);
    document.addEventListener('toggleProjectData', handleDataToggle);
    return () => document.removeEventListener('toggleProjectData', handleDataToggle);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.conversationHistory]);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (historyLoaded) return; // Prevent multiple loads
      
      try {
        // Clear localStorage to prevent conflicts with API data
        localStorage.removeItem('agentSession');
        
        const response = await fetch('/api/chat/history', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
              addMessage({
                type: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content,
                timestamp: msg.timestamp
              });
            });
          }
          setHistoryLoaded(true); // Mark as loaded
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [historyLoaded, addMessage]); // Only depend on load flag

  useEffect(() => {
    if (projectData) {
      setContext({
        currentProject: projectData.name,
        projectType: projectData.type,
        projectStatus: projectData.status
      });

      // Store project context for memory
      updateMemory({
        lastProject: projectData.name,
        projectContext: {
          budget: projectData.budget,
          progress: projectData.progress
        }
      });
    }
  }, [projectData, setContext, updateMemory]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { type: 'user', content: message };
    addMessage(userMessage);
    setInputValue('');
    setIsTyping(true);
    setIsProcessing(true);
    setCurrentActions([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add action stream messages as individual chat messages
        if (data.action_stream && data.action_stream.length > 0) {
          data.action_stream.forEach((action, index) => {
            setTimeout(() => {
              addMessage({
                type: 'system',
                content: `${action.type === 'analyzing' ? '🔍' : 
                         action.type === 'creating' ? '✨' : 
                         action.type === 'identifying' ? '👥' : 
                         action.type === 'assessing' ? '⚠️' : 
                         action.type === 'generating' ? '📊' : '⚡'} ${action.title}`,
                timestamp: new Date().toISOString()
              });
            }, index * 800); // Stagger the messages
          });
        }
        
        // Add project status as a formatted chat message
        if (data.project_status) {
          const project = data.project_status;
          setTimeout(() => {
            const statusMessage = `🏥 **${project.name}** 
📍 ${project.organization}
📊 Status: ${project.status} (${project.progress}% ${project.phase})

📋 **Auto-Generated:**
${project.artifacts?.map(a => `• ${a.name}`).join('\n') || '• Project Charter (Draft)\n• 12 Stakeholders identified\n• 6 Initial risks logged'}

⚡ **Next Actions:**
${project.nextActions?.map(a => `→ ${a}`).join('\n') || '→ Review stakeholder list\n→ Approve project charter\n→ Schedule kickoff meeting'}`;

            addMessage({
              type: 'system',
              content: statusMessage,
              timestamp: new Date().toISOString()
            });
          }, (data.action_stream?.length || 0) * 800 + 500);
        }
        
        // Add change proposals as interactive messages
        if (data.change_proposals && data.change_proposals.length > 0) {
          setTimeout(() => {
            const proposalsMessage = `🔧 **I want to make these changes to the database:**

${data.change_proposals.map((proposal, index) => {
  const formattedData = Object.entries(proposal.data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      if (key.includes('date') || key.includes('_at')) {
        return `  ${key}: ${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`;
      }
      return `  ${key}: ${value}`;
    })
    .join('\n');
  
  return `
**${index + 1}. ${proposal.type.replace('_', ' ').toUpperCase()}**
Rationale: ${proposal.rationale}

Database Record:
\`\`\`
${formattedData}
\`\`\`
`;
}).join('')}

Should I execute these changes?`;

            addMessage({
              type: 'proposal',
              content: proposalsMessage,
              timestamp: new Date().toISOString(),
              proposals: data.change_proposals
            });
          }, ((data.action_stream?.length || 0) * 800) + (data.project_status ? 2000 : 1000));
        }
        
        // Add final AI response
        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: data.response,
            timestamp: data.timestamp
          });
        }, ((data.action_stream?.length || 0) * 800) + (data.project_status ? 1500 : 500) + (data.change_proposals?.length > 0 ? 1000 : 0));
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      
      if (processCommand(message)) return;
      
      const fallbackResponse = generateFallbackResponse(message, state.currentAgent);
      addMessage({
        type: 'assistant',
        content: fallbackResponse
      });
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  const generateFallbackResponse = (message) => {
    const projectName = state.contextData.currentProject || 'your project';
    return `🤖 I'm analyzing your request about "${message}" for ${projectName}. The chat API is currently unavailable, but I'm here to help once the connection is restored.`;
  };

  const handleSendMessage = () => sendMessage(inputValue);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  const executeQuickCommand = (command) => {
    setInputValue(command);
    sendMessage(command);
  };

  const handleLogout = async () => {
    await dispatch(thunkLogout());
  };

  const handleQuickData = (label, data) => {
    // Display quick data as formatted terminal output
    let content = '';
    
    if (label === 'status') {
      content = `📊 **PROJECT STATUS**

Project: ${data.project || 'None'}
Status: ${data.status}
Stakeholders: ${data.stakeholders}
Risks: ${data.risks}  
Work Packages: ${data.work_packages}
Last Updated: ${data.last_updated}`;

    } else if (label === 'charter') {
      const charter = data.project_charter;
      content = `📋 **PROJECT CHARTER**

Name: ${charter.name}
Description: ${charter.description}
Status: ${charter.status}
Owner: ${charter.owner}
Created: ${charter.created}
Due Date: ${charter.due_date}`;

    } else if (label === 'wbs') {
      content = `🔨 **WORK BREAKDOWN STRUCTURE** (Project: ${data.project})

${data.wbs.map((wp, i) => `${i+1}. ${wp.name} [${wp.status}]
   Type: ${wp.work_type} | Progress: ${wp.progress_percentage || 0}%
   Hours: ${wp.estimated_hours || 'TBD'} | Priority: ${wp.priority || 'Normal'}
   ${wp.planned_start ? `Start: ${new Date(wp.planned_start).toLocaleDateString()}` : ''}
   ${wp.planned_end ? `End: ${new Date(wp.planned_end).toLocaleDateString()}` : ''}
`).join('\n')}`;

    } else if (label === 'gantt') {
      content = `📊 **GANTT CHART** (Project: ${data.project})

${data.gantt_chart.map((item, i) => `${i+1}. ${item.name} [${item.progress}%]
   ${item.start || 'No start'} → ${item.end || 'No end'}
   Status: ${item.status} | Duration: ${item.duration}h
`).join('\n')}

📋 Gantt Chart Timeline View`;

    } else if (label === 'schedule') {
      content = `📅 **SCHEDULE MANAGEMENT** (Project: ${data.project})

🎯 Schedule Baselines (${data.schedule_baselines.length}):
${data.schedule_baselines.map((s, i) => `${i+1}. ${s.name || 'Baseline'} 
   Start: ${s.baseline_start ? new Date(s.baseline_start).toLocaleDateString() : 'TBD'}
   End: ${s.baseline_end ? new Date(s.baseline_end).toLocaleDateString() : 'TBD'}
`).join('\n')}

🔗 Dependencies (${data.dependencies.length}):
${data.dependencies.map((d, i) => `${i+1}. ${d.dependency_type} dependency
   ${d.predecessor_activity} → ${d.successor_activity}
`).join('\n')}`;

    } else if (label === 'budget') {
      content = `💰 **COST MANAGEMENT** (Project: ${data.project})

💼 Budgets (${data.budgets.length}):
${data.budgets.map((b, i) => `${i+1}. ${b.budget_category}
   Allocated: $${(b.allocated_amount || 0).toLocaleString()}
   Spent: $${(b.spent_amount || 0).toLocaleString()}
   Remaining: $${((b.allocated_amount || 0) - (b.spent_amount || 0)).toLocaleString()}
`).join('\n')}

📊 Cost Estimates (${data.cost_estimates.length}):
${data.cost_estimates.map((e, i) => `${i+1}. ${e.estimate_type}
   Amount: $${(e.estimated_cost || 0).toLocaleString()}
   Confidence: ${e.confidence_level || 'TBD'}
`).join('\n')}`;

    } else if (label === 'quality') {
      content = `✅ **QUALITY MANAGEMENT** (Project: ${data.project})

📋 Quality Plans (${data.quality_plans.length}):
${data.quality_plans.map((p, i) => `${i+1}. ${p.plan_name}
   Objective: ${p.quality_objective}
   Standard: ${p.quality_standard}
`).join('\n')}

📊 Quality Metrics (${data.quality_metrics.length}):
${data.quality_metrics.map((m, i) => `${i+1}. ${m.metric_name}
   Target: ${m.target_value} | Actual: ${m.actual_value || 'TBD'}
   Status: ${m.status}
`).join('\n')}

⚠️ Quality Issues (${data.quality_issues.length}):
${data.quality_issues.map((issue, i) => `${i+1}. ${issue.issue_title} [${issue.severity}]
   Status: ${issue.status}
`).join('\n')}`;

    } else if (label === 'comms') {
      content = `📢 **COMMUNICATIONS MANAGEMENT** (Project: ${data.project})

📋 Communication Plans (${data.communication_plans.length}):
${data.communication_plans.map((p, i) => `${i+1}. ${p.plan_name}
   Stakeholder: ${p.stakeholder_group}
   Method: ${p.communication_method}
   Frequency: ${p.frequency}
`).join('\n')}

📝 Activities (${data.activities.length}):
${data.activities.map((a, i) => `${i+1}. ${a.activity_type}
   Status: ${a.status}
   Date: ${a.communication_date ? new Date(a.communication_date).toLocaleDateString() : 'TBD'}
`).join('\n')}

🤝 Meetings (${data.meetings.length}):
${data.meetings.map((m, i) => `${i+1}. ${m.meeting_type}
   Date: ${m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : 'TBD'}
   Duration: ${m.duration_minutes || 60}min
`).join('\n')}`;

    } else if (label === 'procurement') {
      content = `🛒 **PROCUREMENT MANAGEMENT** (Project: ${data.project})

📋 Procurement Plans (${data.procurement_plans.length}):
${data.procurement_plans.map((p, i) => `${i+1}. ${p.procurement_type}
   Method: ${p.procurement_method}
   Timeline: ${p.procurement_timeline}
`).join('\n')}

🏢 Vendors (${data.vendors.length}):
${data.vendors.map((v, i) => `${i+1}. ${v.vendor_name}
   Type: ${v.vendor_type}
   Status: ${v.vendor_status}
`).join('\n')}

📄 Contracts (${data.contracts.length}):
${data.contracts.map((c, i) => `${i+1}. ${c.contract_type}
   Value: $${(c.contract_value || 0).toLocaleString()}
   Status: ${c.contract_status}
   Start: ${c.contract_start_date ? new Date(c.contract_start_date).toLocaleDateString() : 'TBD'}
`).join('\n')}`;

    } else if (label === 'changes') {
      content = `🔄 **CHANGE MANAGEMENT** (Project: ${data.project})

📝 Change Requests (${data.change_requests.length}):
${data.change_requests.map((cr, i) => `${i+1}. ${cr.change_title} [${cr.priority}]
   Status: ${cr.status}
   Impact: ${cr.impact_assessment}
   Requested: ${cr.request_date ? new Date(cr.request_date).toLocaleDateString() : 'TBD'}
`).join('\n')}

📚 Lessons Learned (${data.lessons_learned.length}):
${data.lessons_learned.map((ll, i) => `${i+1}. ${ll.lesson_category}
   Phase: ${ll.project_phase}
   Impact: ${ll.impact_description}
`).join('\n')}`;

    } else if (label === 'risks') {
      content = `⚠️ **RISK LOG** (Project: ${data.project})

${data.risks.map((r, i) => `${i+1}. ${r.title} [${r.risk_level}]
   ${r.description}
   Probability: ${Math.round((r.probability || 0) * 100)}% | Impact: ${Math.round((r.impact || 0) * 100)}%
   Category: ${r.category} | Status: ${r.status}
`).join('\n')}`;

    } else if (label === 'team') {
      content = `👥 **STAKEHOLDERS** (Project: ${data.project})

${data.stakeholders.map((s, i) => `${i+1}. ${s.name} (${s.role})
   Power: ${s.power_level} | Interest: ${s.interest_level}
   Strategy: ${s.influence_strategy}
   Contact: ${s.contact_info || 'No contact info'}
`).join('\n')}`;
    }

    addMessage({
      type: 'system',
      content: content,
      timestamp: new Date().toISOString()
    });
  };

  if (!visible) return null;

  return (
    <div className={`${styles.agent} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <div className={styles.logo}>
          <span>PM Terminal v1.0.0</span>
        </div>
        <div className={styles.topActions}>
          <button 
            className={styles.dataBtn}
            onClick={() => setShowProjectData(!showProjectData)}
            title="View Project Data"
          >
            [DATA]
          </button>
          <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Logout"
          >
            [EXIT]
          </button>
        </div>
      </div>
      
      <ChatHeader 
        projectName={state.contextData.currentProject}
        messageCount={state.conversationHistory.length}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <>
          {/* Visual Feedback Section */}
          <div className={styles.visualFeedback}>
            {/* AI Action Stream - shows when processing */}
            {currentActions && currentActions.length > 0 && (
              <AIActionStream 
                actions={currentActions}
                isProcessing={isProcessing}
              />
            )}
            
            {/* Project Status Card - shows after project creation */}
            {currentProjectStatus && (
              <ProjectStatusCard 
                project={currentProjectStatus}
              />
            )}
          </div>
          
          <MessageList 
            messages={state.conversationHistory}
            isTyping={isTyping}
          />
          <div ref={messagesEndRef} />
          
          <MessageInput 
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            disabled={isTyping}
          />

          <QuickCommands onExecute={executeQuickCommand} onQuickData={handleQuickData} />
        </>
      )}
      
      {/* Project Data Viewer - like IDE sidebar */}
      <ProjectDataViewer 
        visible={showProjectData}
        onToggle={() => setShowProjectData(!showProjectData)}
      />
    </div>
  );
}

function ChatHeader({ 
  projectName, 
  messageCount, 
  isExpanded, 
  onToggleExpanded
}) {
  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <span className={styles.icon}>🤖</span>
        <div className={styles.details}>
          <div className={styles.name}>AI Assistant</div>
          <div className={styles.status}>
            {projectName || 'General Chat'} • {messageCount} messages
          </div>
        </div>
      </div>
      
      <button 
        className={styles.expandBtn}
        onClick={onToggleExpanded}
      >
        {isExpanded ? '−' : '+'}
      </button>
    </div>
  );
}

function MessageList({ messages, isTyping }) {
  return (
    <div className={styles.messages}>
      {messages.map((message, index) => (
        <Message 
          key={index} 
          message={message}
        />
      ))}
      
      {isTyping && (
        <div className={`${styles.message} ${styles.assistant}`}>
          <div className={styles.content}>
            <TypingIndicator />
          </div>
        </div>
      )}
    </div>
  );
}

function Message({ message }) {
  const handleApproveProposal = async (proposals) => {
    try {
      const response = await fetch('/api/chat/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ proposals })
      });

      if (response.ok) {
        const result = await response.json();
        // The system message will be added through the chat history refresh
        window.location.reload(); // Simple refresh to show updated data
      }
    } catch (error) {
      console.error('Error executing changes:', error);
    }
  };

  return (
    <div className={`${styles.message} ${styles[message.type]}`}>
      <div className={styles.content}>
        {message.content.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      
      {message.type === 'proposal' && message.proposals && (
        <div className={styles.proposalActions}>
          <button 
            className={styles.approveButton}
            onClick={() => handleApproveProposal(message.proposals)}
          >
            ✅ Execute Changes
          </button>
          <button 
            className={styles.rejectButton}
            onClick={() => {/* Handle rejection */}}
          >
            ❌ Reject
          </button>
        </div>
      )}
      
      <div className={styles.messageInfo}>
        <span className={styles.timestamp}>
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className={styles.typing}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function MessageInput({ value, onChange, onSend, onKeyDown, placeholder, disabled }) {
  return (
    <div className={styles.inputContainer}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={styles.input}
        rows={2}
        disabled={disabled}
      />
      <button 
        onClick={onSend}
        className={styles.sendBtn}
        disabled={!value.trim() || disabled}
      >
        ⚡
      </button>
    </div>
  );
}

function QuickCommands({ onExecute, onQuickData }) {
  const commands = [
    // Core PM Commands
    { label: 'help', command: 'help', type: 'chat' },
    { label: 'status', endpoint: '/api/chat/quick/status', type: 'data' },
    { label: 'charter', endpoint: '/api/chat/quick/charter', type: 'data' },
    
    // Project Artifacts (PMI Knowledge Areas)
    { label: 'wbs', endpoint: '/api/chat/quick/wbs', type: 'data' },
    { label: 'gantt', endpoint: '/api/chat/quick/gantt', type: 'data' },
    { label: 'schedule', endpoint: '/api/chat/quick/schedule', type: 'data' },
    { label: 'budget', endpoint: '/api/chat/quick/budget', type: 'data' },
    { label: 'quality', endpoint: '/api/chat/quick/quality', type: 'data' },
    { label: 'comms', endpoint: '/api/chat/quick/comms', type: 'data' },
    { label: 'procurement', endpoint: '/api/chat/quick/procurement', type: 'data' },
    { label: 'changes', endpoint: '/api/chat/quick/changes', type: 'data' },
    
    // People & Risk
    { label: 'risks', endpoint: '/api/chat/quick/risks', type: 'data' },
    { label: 'team', endpoint: '/api/chat/quick/stakeholders', type: 'data' },
    
    // Actions
    { label: 'data', action: 'toggleData', type: 'action' },
    { label: 'clear', command: 'clear', type: 'chat' }
  ];

  const handleCommand = async (cmd) => {
    if (cmd.type === 'chat') {
      onExecute(cmd.command);
    } else if (cmd.type === 'data') {
      try {
        const response = await fetch(cmd.endpoint, {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          onQuickData(cmd.label, data);
        }
      } catch (error) {
        console.error(`Error fetching ${cmd.label}:`, error);
        onExecute(`Error loading ${cmd.label} data`);
      }
    } else if (cmd.type === 'action' && cmd.action === 'toggleData') {
      // This will be handled by parent component
      const dataToggleEvent = new CustomEvent('toggleProjectData');
      document.dispatchEvent(dataToggleEvent);
    }
  };

  return (
    <div className={styles.quickCommands}>
      <div className={styles.commandGroup}>
        <span className={styles.groupLabel}>core:</span>
        {commands.slice(0, 3).map((cmd) => (
          <button key={cmd.label} onClick={() => handleCommand(cmd)} className={styles.quickBtn}>
            {cmd.label}
          </button>
        ))}
      </div>
      
      <div className={styles.commandGroup}>
        <span className={styles.groupLabel}>pmi:</span>
        {commands.slice(3, 11).map((cmd) => (
          <button key={cmd.label} onClick={() => handleCommand(cmd)} className={styles.quickBtn}>
            {cmd.label}
          </button>
        ))}
      </div>
      
      <div className={styles.commandGroup}>
        <span className={styles.groupLabel}>people:</span>
        {commands.slice(11, 13).map((cmd) => (
          <button key={cmd.label} onClick={() => handleCommand(cmd)} className={styles.quickBtn}>
            {cmd.label}
          </button>
        ))}
      </div>
      
      <div className={styles.commandGroup}>
        <span className={styles.groupLabel}>actions:</span>
        {commands.slice(13).map((cmd) => (
          <button key={cmd.label} onClick={() => handleCommand(cmd)} className={styles.quickBtn}>
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp) {
  if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default SuperUserAgent;