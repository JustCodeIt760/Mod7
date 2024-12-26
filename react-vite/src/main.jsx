import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import configureStore from './redux/store';
import { router } from './router';
import * as sessionActions from './redux/session';
import * as projectActions from './redux/project';
import * as featureActions from './redux/feature';
import * as sprintActions from './redux/sprint';
import * as taskActions from './redux/task';
import './index.css';

const store = configureStore();

if (import.meta.env.MODE !== 'production') {
  // Add all stores and actions to window
  window.store = store;
  window.sessionActions = sessionActions;
  window.projectActions = projectActions;
  window.featureActions = featureActions;
  window.sprintActions = sprintActions;
  window.taskActions = taskActions;

  // Add comprehensive test helpers
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

    // Project tests
    loadProjects: async () => {
      const result = await store.dispatch(projectActions.thunkLoadProjects());
      console.log('Projects:', result);
    },
    getProject: async (id) => {
      const result = await store.dispatch(projectActions.thunkSetProject(id));
      console.log('Project:', result);
    },
    createProject: async (projectData) => {
      const result = await store.dispatch(
        projectActions.thunkAddProject(projectData)
      );
      console.log('New project:', result);
    },

    // Feature tests
    loadFeatures: async (projectId) => {
      const result = await store.dispatch(
        featureActions.thunkLoadFeatures(projectId)
      );
      console.log('Features:', result);
    },
    moveFeature: async (projectId, featureId, sprintId) => {
      const result = await store.dispatch(
        featureActions.thunkMoveFeature(projectId, featureId, sprintId)
      );
      console.log('Moved feature:', result);
    },

    // Sprint tests
    loadSprints: async (projectId) => {
      const result = await store.dispatch(
        sprintActions.thunkLoadSprints(projectId)
      );
      console.log('Sprints:', result);
    },
    createSprint: async (projectId, sprintData) => {
      const result = await store.dispatch(
        sprintActions.thunkAddSprint(projectId, sprintData)
      );
      console.log('New sprint:', result);
    },

    // Task tests
    loadTasks: async () => {
      const result = await store.dispatch(taskActions.thunkLoadTasks());
      console.log('Tasks:', result);
    },
    createTask: async (taskData) => {
      const result = await store.dispatch(taskActions.thunkAddTask(taskData));
      console.log('New task:', result);
    },

    // State inspection
    getState: () => console.log('Current state:', store.getState()),
    getUser: () => console.log('Current user:', store.getState().session.user),
    getAllProjects: () =>
      console.log('All projects:', store.getState().projects.allProjects),
    getAllFeatures: () =>
      console.log('All features:', store.getState().features.allFeatures),
    getAllSprints: () =>
      console.log('All sprints:', store.getState().sprints.allSprints),
    getAllTasks: () =>
      console.log('All tasks:', store.getState().tasks.allTasks),

    // Example data
    sampleProject: {
      name: 'Test Project',
      description: 'A test project created from console',
      due_date: '2024-12-31',
    },
    sampleSprint: {
      name: 'Test Sprint',
      start_date: '2024-01-01',
      end_date: '2024-01-15',
    },
    sampleFeature: {
      name: 'Test Feature',
      description: 'A test feature',
      status: 'Not Started',
      priority: 1,
    },
    sampleTask: {
      name: 'Test Task',
      description: 'A test task',
      status: 'Not Started',
      priority: 1,
    },
  };

  // Usage examples in console
  console.log(`
    Available test commands:
    
    // Auth
    testHelpers.login()
    testHelpers.logout()
    
    // Projects
    testHelpers.loadProjects()
    testHelpers.createProject(testHelpers.sampleProject)
    
    // Features
    testHelpers.loadFeatures(projectId)
    
    // Sprints
    testHelpers.loadSprints(projectId)
    
    // Tasks
    testHelpers.loadTasks()
    
    // State
    testHelpers.getState()
    testHelpers.getUser()
    testHelpers.getAllProjects()
  `);
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <RouterProvider router={router} />
    </ReduxProvider>
  </React.StrictMode>
);
