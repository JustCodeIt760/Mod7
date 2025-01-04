import { csrfFetch } from '../utils/csrf';

const baseError = { server: 'Something went wrong' };

//! Actions
const LOAD_SPRINTS = 'sprints/loadSprints';
const SET_SPRINT = 'sprints/setSprint';
const ADD_SPRINT = 'sprints/addSprint';
const UPDATE_SPRINT = 'sprints/updateSprint';
const REMOVE_SPRINT = 'sprints/removeSprint';
const SET_LOADING = 'sprints/setLoading';
const SET_ERRORS = 'sprints/setErrors';

//! Action Creators
export const loadSprints = (sprintsData) => ({
  type: LOAD_SPRINTS,
  payload: sprintsData,
});

export const setSprint = (sprint) => ({
  type: SET_SPRINT,
  payload: sprint,
});

export const addSprint = (sprint) => ({
  type: ADD_SPRINT,
  payload: sprint,
});

export const updateSprint = (sprint) => ({
  type: UPDATE_SPRINT,
  payload: sprint,
});

export const removeSprint = (sprintId) => ({
  type: REMOVE_SPRINT,
  payload: sprintId,
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setErrors = (errors) => ({
  type: SET_ERRORS,
  payload: errors,
});

//! Thunks
export const thunkLoadSprints = (projectId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(`/projects/${projectId}/sprints`);
    const data = await response.json();
    dispatch(loadSprints(data));
    dispatch(setErrors(null));
    return data;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkSetSprint =
  (projectId, sprintId) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    const state = getState();
    const cachedSprint = state.sprints.allSprints[sprintId];

    // If the sprint is already cached, use it
    if (cachedSprint) {
      dispatch(setSprint(cachedSprint));
      dispatch(setErrors(null));
      dispatch(setLoading(false));
      return cachedSprint;
    }

    // If not cached, fetch the sprint details from the API
    try {
      const response = await csrfFetch(
        `/projects/${projectId}/sprints/${sprintId}`
      );
      const data = await response.json();
      if (response.ok) {
        dispatch(setSprint(data));
        dispatch(setErrors(null));
        return data;
      } else {
        dispatch(setErrors(data));
        return null;
      }
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkAddSprint = (projectId, sprintData) => async dispatch => {
  try {
    const response = await csrfFetch(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sprintData),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(addSprint(data));
      return data;
    } else {
      const errors = await response.json();
      return { errors };
    }
  } catch (error) {
    return {
      errors: { general: 'An error occurred while creating the sprint' },
    };
  }
};

export const thunkUpdateSprint = (projectId, sprintData) => async dispatch => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(
      `/projects/${projectId}/sprints/${sprintData.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sprintData),
      }
    );

    if (response.ok) {
      const updatedSprint = await response.json();
      dispatch(updateSprint(updatedSprint));
      // Reload all sprints to ensure consistency
      await dispatch(thunkLoadSprints(projectId));
      dispatch(setErrors(null));
      return updatedSprint;
    } else {
      const errors = await response.json();
      dispatch(setErrors(errors));
      return { errors };
    }
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkRemoveSprint = (projectId, sprintId) => async dispatch => {
  dispatch(setLoading(true));
  try {
    await csrfFetch(`/projects/${projectId}/sprints/${sprintId}`, {
      method: 'DELETE',
    });
    dispatch(removeSprint(sprintId));
    dispatch(setErrors(null));
    return true;
  } catch (error) {
    dispatch(setErrors(error.errors || baseError));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

//! Initial State
const initialState = {
  allSprints: {},
  singleSprint: null,
  isLoading: false,
  errors: null,
};

//! Reducer
const sprintReducer = (state = initialState, action) => {
  const handlers = {
    [LOAD_SPRINTS]: (state, action) => {
      // Convert array to object in single operation
      const newSprints = action.payload.reduce(
        (acc, sprint) => ({
          ...acc,
          [sprint.id]: sprint,
        }),
        {}
      );

      return {
        ...state,
        allSprints: {
          ...state.allSprints,
          ...newSprints,
        },
      };
    },

    [SET_SPRINT]: (state, action) => {
      return {
        ...state,
        singleSprint: action.payload,
        allSprints: {
          ...state.allSprints,
          [action.payload.id]: action.payload,
        },
      };
    },

    [ADD_SPRINT]: (state, action) => {
      return {
        ...state,
        allSprints: {
          ...state.allSprints,
          [action.payload.id]: action.payload,
        },
      };
    },

    [UPDATE_SPRINT]: (state, action) => {
      const updatedSprint = action.payload;
      return {
        ...state,
        allSprints: {
          ...state.allSprints,
          [updatedSprint.id]: updatedSprint,
        },
        singleSprint:
          state.singleSprint?.id === updatedSprint.id
            ? updatedSprint
            : state.singleSprint,
      };
    },

    [REMOVE_SPRINT]: (state, action) => {
      // Use object destructuring to remove the sprint
      const { [action.payload]: removedSprint, ...remainingSprints } =
        state.allSprints;

      return {
        ...state,
        allSprints: remainingSprints,
        singleSprint:
          state.singleSprint?.id === action.payload ? null : state.singleSprint,
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

  return handlers[action.type] ? handlers[action.type](state, action) : state;
};

export default sprintReducer;
