import { csrfFetch } from '../utils/csrf';

//! TO IMPLEMENT: optimistic loading, add front end ownership check for update, delete

// baseError to send back if there is no error response from the csrfFetch
const baseError = { server: 'Something went wrong' };
//Constants

const LOAD_PROJECTS = 'projects/loadProjects';
const SET_PROJECT = 'projects/setProject';
const ADD_PROJECT = 'projects/addProject';
const UPDATE_PROJECT = 'projects/updateProject';
const REMOVE_PROJECT = 'projects/removeProject';
const SET_LOADING = 'projects/setLoading';
const SET_ERRORS = 'projects/setErrors';

//Actions

export const loadProjects = (projectsData) => ({
  type: LOAD_PROJECTS,
  payload: projectsData,
});

export const setProject = (project) => ({
  type: SET_PROJECT,
  payload: project,
});

export const addProject = (project) => ({
  type: ADD_PROJECT,
  payload: project,
});

export const updateProject = (project) => ({
  type: UPDATE_PROJECT,
  payload: project,
});

export const removeProject = (projectId) => ({
  type: REMOVE_PROJECT,
  payload: projectId,
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setErrors = (errors) => ({
  type: SET_ERRORS,
  payload: errors,
});

//Thunks

export const thunkLoadProjects = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/projects');
    const data = await response.json();
    dispatch(loadProjects(data));
    dispatch(setErrors(null));
  } catch (err) {
    // utilizing setErrors so we have easy access to error responses
    dispatch(setErrors(err.errors || baseError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkSetProject = (projectId) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  // using getState() to quickly pull the project by ID if it exists from our store
  const state = getState();
  const cachedProject = state.projects.allProjects[projectId];
  if (cachedProject) {
    dispatch({
      type: SET_PROJECT,
      payload: cachedProject,
    });
  }
  // utilize thunk to get fresh data and update if it changes. speed of store + accuracy of new data
  try {
    const response = await csrfFetch(`/projects/${projectId}`);
    const data = await response.json();
    dispatch({
      type: SET_PROJECT,
      payload: data,
    });
    dispatch(setErrors(null));
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkAddProject = (projectData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    const newProject = await response.json();
    dispatch(addProject(newProject));
    dispatch(setErrors(null));
    return newProject;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkUpdateProject = (projectData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(`/projects/${projectData.id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    const updatedProject = await response.json();
    dispatch(updateProject(updatedProject));
    dispatch(setErrors(null));
    return updatedProject;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkRemoveProject = (projectId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(`/projects/${projectId}`, {
      method: 'DELETE',
    });
    dispatch(removeProject(projectId));
    dispatch(setErrors(null));
    return true;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Initial state object defining the structure of the project state
const initialState = {
  allProjects: {}, // Object to store all projects, keyed by project ID
  singleProject: null, // Currently selected/active project
  isLoading: false, // Flag to track loading state
  errors: null, // Store any error messages
};

// Reducer function to handle state changes based on dispatched actions
const projectReducer = (state = initialState, action) => {
  // Object containing handler functions for different action types
  const handlers = {
    // Handler for loading multiple projects
    [LOAD_PROJECTS]: (state, action) => {
      // Create a copy of the current state to avoid direct mutation
      const newState = { ...state };
      // Iterate through each project in the payload
      action.payload.forEach((project) => {
        // Add each project to allProjects object, using project ID as key
        newState.allProjects[project.id] = project;
      });
      // Return the updated state
      return newState;
    },

    // Handler for setting a single project
    [SET_PROJECT]: (state, action) => {
      // Create a copy of the current state
      const newState = { ...state };
      // Set the single project to the payload
      newState.singleProject = action.payload;
      // If a project is provided, update/add it to allProjects
      if (action.payload) {
        newState.allProjects[action.payload.id] = action.payload;
      }
      // Return the updated state
      return newState;
    },

    // Handler for adding a new project
    [ADD_PROJECT]: (state, action) => {
      // Create a copy of the current state
      const newState = { ...state };
      // Add the new project to allProjects using its ID as key
      newState.allProjects[action.payload.id] = action.payload;
      // Return the updated state
      return newState;
    },

    // Handler for updating an existing project
    [UPDATE_PROJECT]: (state, action) => {
      // Create a copy of the current state
      const newState = { ...state };
      // Update the project in allProjects using its ID
      newState.allProjects[action.payload.id] = action.payload;
      // Return the updated state
      return newState;
    },

    // Handler for removing a project
    [REMOVE_PROJECT]: (state, action) => {
      // Create a copy of the current state
      const newState = { ...state };
      // Remove the project from allProjects using its ID
      delete newState.allProjects[action.payload];
      // Return the updated state
      return newState;
    },

    // Handler for setting loading state
    [SET_LOADING]: (state, action) => {
      // Create a copy of the current state
      const newState = { ...state };
      // Update the isLoading flag
      newState.isLoading = action.payload;
      // Return the updated state
      return newState;
    },

    // Handler for setting error state
    [SET_ERRORS]: (state, action) => {
      // Create a copy of the current state
      const newState = { ...state };
      // Update the errors
      newState.errors = action.payload;
      // Return the updated state
      return newState;
    }
  };

  // Check if a handler exists for the current action type
  // If it does, call the handler; otherwise, return the current state
  return handlers[action.type] ? handlers[action.type](state, action) : state;
};
//Selectors

export default projectReducer;
