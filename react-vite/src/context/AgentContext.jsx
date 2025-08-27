import { createContext, useContext, useReducer, useEffect } from 'react';

const AgentContext = createContext();

const initialState = {
  conversationHistory: [],
  contextData: {
    currentProject: null,
    currentTask: null,
    userPreferences: {},
    shortcuts: {}
  },
  memory: {},
  sessionActive: false
};

function agentReducer(state, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversationHistory: [...state.conversationHistory, {
          ...action.payload,
          id: Date.now(),
          timestamp: new Date()
        }]
      };

    case 'SET_CONTEXT':
      return {
        ...state,
        contextData: { ...state.contextData, ...action.payload }
      };

    case 'UPDATE_MEMORY':
      return {
        ...state,
        memory: { ...state.memory, ...action.payload }
      };

    case 'START_SESSION':
      return {
        ...state,
        sessionActive: true,
        conversationHistory: [
          {
            id: Date.now(),
            type: 'system',
            content: '🤖 AI Assistant ready to help',
            timestamp: new Date()
          }
        ]
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        conversationHistory: []
      };

    default:
      return state;
  }
}

export function AgentProvider({ children }) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  // Persist session data to localStorage
  useEffect(() => {
    if (state.sessionActive) {
      localStorage.setItem('chatSession', JSON.stringify({
        conversationHistory: state.conversationHistory.slice(-50), // Keep last 50 messages
        contextData: state.contextData
      }));
    }
  }, [state]);

  // Disable localStorage loading - we use API loading instead  
  useEffect(() => {
    // Clear any existing localStorage data
    localStorage.removeItem('chatSession');
    // Always start fresh session
    dispatch({ type: 'START_SESSION' });
  }, []);

  const addMessage = (message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const updateMemory = (memoryData) => {
    dispatch({ type: 'UPDATE_MEMORY', payload: memoryData });
  };

  const setContext = (contextData) => {
    dispatch({ type: 'SET_CONTEXT', payload: contextData });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  const processCommand = (command) => {
    // Basic command processing
    const shortcuts = {
      '/clear': () => clearHistory(),
      '/status': () => addMessage({
        type: 'system',
        content: `Session Messages: ${state.conversationHistory.length}\nActive Context: ${state.contextData.currentProject || 'General Chat'}`
      }),
      '/help': () => addMessage({
        type: 'system',
        content: `Available Commands:\n/clear - Clear chat history\n/status - Show session info\n/help - Show this help`
      })
    };

    if (shortcuts[command]) {
      shortcuts[command]();
      return true;
    }
    return false;
  };

  const value = {
    state,
    addMessage,
    updateMemory,
    setContext,
    clearHistory,
    processCommand
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};