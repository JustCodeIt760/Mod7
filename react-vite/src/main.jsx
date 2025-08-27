import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Modal, ModalProvider } from './context/Modal';
import { AgentProvider } from './context/AgentContext';
import './index.css';
import * as sessionActions from './redux/session';
import configureStore from './redux/store';
import { router } from './router';

const store = configureStore();

if (import.meta.env.MODE !== 'production') {
  // Add session store and actions to window
  window.store = store;
  window.sessionActions = sessionActions;

  // Add auth test helpers
  window.testHelpers = {
    // Session tests
    login: async () => {
      const result = await store.dispatch(
        sessionActions.thunkLogin({
          email: 'sarah@aa.io',
          password: 'password',
        })
      );
      console.log('Login result:', result);
    },
    logout: async () => {
      const result = await store.dispatch(sessionActions.thunkLogout());
      console.log('Logout result:', result);
    },

    // State inspection
    getState: () => console.log('Current state:', store.getState()),
    getUser: () => console.log('Current user:', store.getState().session.user),
  };

  // Usage examples in console
  console.log(`
    Available test commands:

    // Auth
    testHelpers.login()
    testHelpers.logout()

    // State
    testHelpers.getState()
    testHelpers.getUser()
  `);
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <ModalProvider>
      <ReduxProvider store={store}>
        <AgentProvider>
          <RouterProvider router={router} />
          <Modal />
        </AgentProvider>
      </ReduxProvider>
    </ModalProvider>
  </>
);
