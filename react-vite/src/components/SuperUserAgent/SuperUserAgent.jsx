import { useState, useRef, useEffect } from 'react';
import { useAgent } from '../../context/AgentContext';
import styles from './SuperUserAgent.module.css';

function SuperUserAgent({ projectData = null, visible = true }) {
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        addMessage({
          type: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        });
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

  if (!visible) return null;

  return (
    <div className={`${styles.agent} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <ChatHeader 
        projectName={state.contextData.currentProject}
        messageCount={state.conversationHistory.length}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <>
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
  return (
    <div className={`${styles.message} ${styles[message.type]}`}>
      <div className={styles.content}>
        {message.content.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
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