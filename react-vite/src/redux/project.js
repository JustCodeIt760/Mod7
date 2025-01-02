import { createSelector } from '@reduxjs/toolkit';
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
    dispatch(loadProjects(data.projects));
    dispatch(setErrors(null));
    return data.projects;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
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
    dispatch(setProject(cachedProject));
  }
  // utilize thunk to get fresh data and update if it changes. speed of store + accuracy of new data
  try {
    const response = await csrfFetch(`/projects/${projectId}`);
    const data = await response.json();
    dispatch(setProject(data));
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
    await csrfFetch(`/projects/${projectId}`, {
      method: 'DELETE',
    });
    dispatch(removeProject(projectId));
    dispatch(setErrors(null));
    return true;
  } catch (error) {
    dispatch(setErrors(error.errors || baseError));
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
  const handlers = {
    [LOAD_PROJECTS]: (state, action) => {
      // Convert array to object in single operation
      const newProjects = action.payload.reduce(
        (acc, project) => ({
          ...acc,
          [project.id]: project,
        }),
        {}
      );

      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          ...newProjects,
        },
      };
    },

    [SET_PROJECT]: (state, action) => {
      if (!action.payload) {
        return state;
      }

      return {
        ...state,
        singleProject: action.payload,
        allProjects: {
          ...state.allProjects,
          [action.payload.id]: action.payload,
        },
      };
    },

    [ADD_PROJECT]: (state, action) => {
      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          [action.payload.id]: action.payload,
        },
      };
    },

    [UPDATE_PROJECT]: (state, action) => {
      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          [action.payload.id]: action.payload,
        },
      };
    },

    [REMOVE_PROJECT]: (state, action) => {
      // Use object destructuring for immutable removal
      const { [action.payload.id]: removedProject, ...remainingProjects } =
        state.allProjects;

      return {
        ...state,
        allProjects: remainingProjects,
      };
    },

    [SET_LOADING]: (state, action) => {
      return {
        ...state,
        isLoading: action.payload,
      };
    },

    [SET_ERRORS]: (state, action) => {
      return {
        ...state,
        errors: action.payload,
      };
    },
  };

  // Add error boundary and validation
  try {
    const handler = handlers[action.type];
    if (!handler) return state;

    // Validate payload for relevant actions
    if ([ADD_PROJECT, UPDATE_PROJECT, SET_PROJECT].includes(action.type)) {
      if (!action.payload?.id) {
        console.warn(`Invalid payload for ${action.type}`);
        return state;
      }
    }

    return handler(state, action);
  } catch (error) {
    console.error(`Error in projectReducer handling ${action.type}:`, error);
    return state;
  }
};
//Selectors
export const selectAllProjects = (state) => state.projects.allProjects;
export const selectCurrentProject = (state) => state.projects.singleProject;
export const selectIsLoading = (state) => state.projects.isLoading;
export const selectErrors = (state) => state.projects.errors;

export const selectProjectById = (projectId) =>
  createSelector([selectAllProjects], (allProjects) => allProjects[projectId]);

export const selectOwnedProjects = (userId) =>
  createSelector([selectAllProjects], (allProjects) =>
    Object.values(allProjects).filter((project) => project.owner_id === userId)
  );

export const selectMemberProjects = (userId) =>
  createSelector([selectAllProjects], (allProjects) =>
    Object.values(allProjects).filter(
      (project) =>
        project.members?.includes(userId) && project.owner_id !== userId
    )
  );

export const selectProjectsByStatus = (status) =>
  createSelector([selectAllProjects], (allProjects) =>
    Object.values(allProjects).filter((project) => project.status === status)
  );

export const selectProjectsDueWithinDays = (days) =>
  createSelector([selectAllProjects], (allProjects) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return Object.values(allProjects).filter((project) => {
      const dueDate = new Date(project.due_date);
      return dueDate <= futureDate && dueDate >= new Date();
    });
  });

export default projectReducer;
