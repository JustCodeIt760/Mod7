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

  if (!visible) return null;

  return (
    <div className={`${styles.agent} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <div className={styles.logo}>
          <span>🤖</span>
          <span>TaskFlow AI Assistant</span>
        </div>
        <div className={styles.topActions}>
          <button 
            className={styles.dataBtn}
            onClick={() => setShowProjectData(!showProjectData)}
            title="View Project Data"
          >
            📊 Data
          </button>
          <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Logout"
          >
            Logout
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
            placeholder="Ask me anything..."
            disabled={isTyping}
          />

          <QuickCommands onExecute={executeQuickCommand} />
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

function QuickCommands({ onExecute }) {
  const commands = [
    { label: 'Help', command: '/help' },
    { label: 'Status', command: '/status' },
    { label: 'Clear', command: '/clear' }
  ];

  return (
    <div className={styles.quickCommands}>
      {commands.map(({ label, command }) => (
        <button 
          key={label}
          onClick={() => onExecute(command)}
          className={styles.quickBtn}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function formatTimestamp(timestamp) {
  if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default SuperUserAgent;