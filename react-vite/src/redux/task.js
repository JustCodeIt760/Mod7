import { csrfFetch } from '../utils/csrf';
import { createSelector } from '@reduxjs/toolkit';

//! TO IMPLEMENT: optimistic loading, add front end ownership check for update, delete

// baseError to send back if there is no error response from the csrfFetch
const baseError = { server: 'Something went wrong' };

//CONSTANTS
const LOAD_TASKS = 'tasks/loadTasks';
const SET_TASK = 'tasks/setTask';
const ADD_TASK = 'tasks/addTask';
const UPDATE_TASK = 'tasks/updateTask';
const REMOVE_TASK = 'tasks/removeTask';
const SET_LOADING = 'tasks/setLoading';
const SET_ERROR = 'tasks/setErrors';

//ACTIONS
export const loadTasks = (tasksData) => ({
  type: LOAD_TASKS,
  payload: tasksData,
});

export const setTask = (task) => ({
  type: SET_TASK,
  payload: task,
});

export const addTask = (task) => ({
  type: ADD_TASK,
  payload: task,
});

export const updateTask = (task) => ({
  type: UPDATE_TASK,
  payload: task,
});

export const removeTask = (taskId) => ({
  type: REMOVE_TASK,
  payload: taskId,
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setErrors = (errors) => ({
  type: SET_ERROR,
  payload: errors,
});

//THUNKS
export const thunkLoadTasks = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/api/tasks');
    const data = await response.json();
    dispatch(loadTasks(data));
    dispatch(setErrors(null));
  } catch (error) {
    // utilizing setErrors so we have easy access to error responses
    dispatch(setErrors(error.errors || baseError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkSetTask = (taskId) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  // using getState() to quickly pull the task by ID if it exists from our store
  const state = getState();
  const cachedTask = state.tasks.allTasks[taskId];
  if (cachedTask) {
    dispatch(setTask(cachedTask));
  }
  // utilize thunk to get fresh data and update if it changes. speed of store + accuracy of new data
  try {
    const response = await csrfFetch(`/api/tasks/${taskId}`);
    const data = await response.json();
    dispatch({
      type: SET_TASK,
      payload: data,
    });
    dispatch(setErrors(null));
  } catch (error) {
    dispatch(setErrors(error.errors || baseError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkAddTask =
  (projectId, featureId, taskData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await csrfFetch(
        `/projects/${projectId}/features/${featureId}/tasks`,
        {
          method: 'POST',
          body: JSON.stringify(taskData),
        }
      );
      const newTask = await response.json();
      dispatch(addTask(newTask));
      dispatch(setErrors(null));
      return newTask;
    } catch (error) {
      dispatch(setErrors(error.errors || baseError));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkUpdateTask = (taskData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(`/api/tasks/${taskData.id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    const updatedTask = await response.json();
    dispatch(updateTask(updatedTask));
    dispatch(setErrors(null));
    return updatedTask;
  } catch (error) {
    dispatch(setErrors(error.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkToggleTaskCompletion = (taskId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log('Attempting to toggle task:', taskId);
    const response = await csrfFetch(`/api/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({}), // Empty body since backend handles toggle logic
    });
    const updatedTask = await response.json();
    console.log('Task updated:', updatedTask);

    dispatch(updateTask(updatedTask));
    dispatch(setErrors(null));
    return updatedTask;
  } catch (error) {
    console.error('Toggle task error:', error);
    dispatch(setErrors(error.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkRemoveTask = (taskId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await csrfFetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    dispatch(removeTask(taskId));
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
  allTasks: {}, //Object to store all tasks, keyed by task ID
  singleTask: null, //Currently selected task
  isLoading: false, //Boolean to indicate if the app is loading
  errors: null, //Object to store any errors
};

//REDUCER FUNCS
const taskReducer = (state = initialState, action) => {
  const handlers = {
    [LOAD_TASKS]: (state, action) => {
      //Handler for loading tasks
      const newState = { ...state };
      //Iterate through each task in the payload and add it to the allTasks object
      const tasks = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      tasks.forEach((task) => {
        //Add each task to allTasks object
        newState.allTasks[task.id] = task;
      });
      //Return the updated state
      return newState;
    },

    // Handler for setting a single task
    [SET_TASK]: (state, action) => {
      //Create a copy of the current state
      const newState = { ...state };
      //Set the single task to the action payload
      newState.singleTask = action.payload;
      // If a project is provided, update/add it to the allTasks object
      if (action.payload) {
        newState.allTasks[action.payload.id] = action.payload;
      }
      //Return the updated state
      return newState;
    },

    //Handler for adding a task
    [ADD_TASK]: (state, action) => {
      //Create a copy of the current state
      const newState = { ...state };
      //Add the new task to the allTasks using the task ID as the key
      newState.allTasks[action.payload.id] = action.payload;
      //Return the updated state
      return newState;
    },

    //Handler for updating a task
    [UPDATE_TASK]: (state, action) => {
      return {
        ...state,
        allTasks: {
          ...state.allTasks,
          [action.payload.id]: action.payload,
        },
      };
    },

    //Handler for removing a task
    [REMOVE_TASK]: (state, action) => {
      //Create a copy of the current state
      const newState = { ...state };
      //Remove the task from allTasks object
      delete newState.allTasks[action.payload];
      //Return the updated state
      return newState;
    },

    //Handler for setting loading state
    [SET_LOADING]: (state, action) => {
      //Create a copy of the current state
      const newState = { ...state };
      //Update isLoading to the flag;
      newState.isLoading = action.payload;
      //Return the updated state
      return newState;
    },

    //Handler for setting errors
    [SET_ERROR]: (state, action) => {
      //Create a copy of the current state
      const newState = { ...state };
      //Update errors to the action payload
      newState.errors = action.payload;
      //Return the updated state
      return newState;
    },
  };

  //Check if a handler exists for the action type
  //If it does, call the handler; otherwise, return the current state
  return handlers[action.type] ? handlers[action.type](state, action) : state;
};

// Selectors
export const selectAllTasks = (state) => state.tasks.allTasks;
export const selectCurrentTask = (state) => state.tasks.singleTask;
export const selectIsLoading = (state) => state.tasks.isLoading;
export const selectErrors = (state) => state.tasks.errors;

export const selectTaskById = (taskId) => (state) =>
  state.tasks.allTasks[taskId];

export const selectTasksByFeature = (featureId) => (state) =>
  Object.values(state.tasks.allTasks).filter(
    (task) => task.feature_id === featureId
  );

export const selectTasksByAssignee = (userId) => (state) =>
  Object.values(state.tasks.allTasks).filter(
    (task) => task.assigned_to === userId
  );

export const selectTasksByStatus = (status) => (state) =>
  Object.values(state.tasks.allTasks).filter((task) => task.status === status);

export const selectOverdueTasks = (state) =>
  Object.values(state.tasks.allTasks).filter(
    (task) =>
      new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

export const selectEnrichedTask = (taskId) =>
  createSelector(
    [
      (state) => state.tasks.allTasks[taskId],
      (state) => state.features.allFeatures,
      (state) => state.projects.allProjects,
    ],
    (task, features, projects) => {
      if (!task) return null;

      const feature = features[task.feature_id];
      const project = feature ? projects[feature.project_id] : null;

      return {
        ...task,
        context: {
          feature: feature
            ? {
                id: feature.id,
                name: feature.name,
                status: feature.status,
              }
            : null,
          project: project
            ? {
                id: project.id,
                name: project.name,
              }
            : null,
        },
        display: {
          dueDate: new Date(task.due_date).toLocaleDateString(),
          priority:
            task.priority === 1
              ? 'High'
              : task.priority === 2
              ? 'Medium'
              : 'Low',
          isOverdue:
            new Date(task.due_date) < new Date() && task.status !== 'Completed',
        },
      };
    }
  );

export const selectEnrichedTasks = createSelector(
  [
    (state) => state.tasks.allTasks,
    (state) => state.features.allFeatures,
    (state) => state.projects.allProjects,
  ],
  (tasks, features, projects) => {
    console.log('Recomputing enriched tasks'); // Debug log
    return Object.values(tasks).map((task) => ({
      ...task,
      context: {
        feature: features[task.feature_id]
          ? {
              id: features[task.feature_id].id,
              name: features[task.feature_id].name,
              status: features[task.feature_id].status,
            }
          : null,
        project:
          features[task.feature_id] &&
          projects[features[task.feature_id].project_id]
            ? {
                id: projects[features[task.feature_id].project_id].id,
                name: projects[features[task.feature_id].project_id].name,
              }
            : null,
      },
      display: {
        dueDate: new Date(task.due_date).toLocaleDateString(),
        priority: ['High', 'Medium', 'Low'][task.priority - 1] || 'Low',
        isOverdue:
          new Date(task.due_date) < new Date() && task.status !== 'Completed',
      },
    }));
  }
);

export default taskReducer;
