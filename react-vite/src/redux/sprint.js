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
      return;
    }

    // If not cached, fetch the sprint details from the API
    try {
      const response = await csrfFetch(
        `/projects/${projectId}/sprints/${sprintId}`
      );
      const data = await response.json();
      dispatch(setSprint(data));
      dispatch(setErrors(null));
      return data;
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkAddSprint = (projectId, sprintData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(`/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify(sprintData),
    });

    const newSprint = await response.json();
    dispatch(addSprint(newSprint));
    dispatch(setErrors(null));
    return newSprint;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkUpdateSprint =
  (projectId, sprintData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await csrfFetch(
        `/projects/${projectId}/sprints/${sprintData.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(sprintData),
        }
      );

      const updatedSprint = await response.json();
      dispatch(updateSprint(updatedSprint));
      dispatch(setErrors(null));
      return updatedSprint;
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkRemoveSprint = (sprintId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await csrfFetch(`/api/sprints/${sprintId}`, {
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
      const newState = { ...state };
      const newSprints = {};
      action.payload.forEach((sprint) => {
        newSprints[sprint.id] = sprint;
      });
      newState.allSprints = {
        ...newState.allSprints,
        ...newSprints,
      };
      return newState;
    },

    [SET_SPRINT]: (state, action) => {
      const newState = { ...state };
      newState.singleSprint = action.payload;
      newState.allSprints = {
        ...newState.allSprints,
        [action.payload.id]: action.payload,
      };
      return newState;
    },

    [ADD_SPRINT]: (state, action) => {
      const newState = { ...state };
      newState.allSprints = {
        ...newState.allSprints,
        [action.payload.id]: action.payload,
      };
      return newState;
    },

    [UPDATE_SPRINT]: (state, action) => {
      const newState = { ...state };
      newState.allSprints = {
        ...newState.allSprints,
        [action.payload.id]: action.payload,
      };
      return newState;
    },

    [REMOVE_SPRINT]: (state, action) => {
      const newState = { ...state };
      const { [action.payload]: removedSprint, ...remainingSprints } =
        newState.allSprints;
      newState.allSprints = remainingSprints;
      return newState;
    },

    [SET_LOADING]: (state, action) => {
      const newState = { ...state };
      newState.isLoading = action.payload;
      return newState;
    },

    [SET_ERRORS]: (state, action) => {
      const newState = { ...state };
      newState.errors = action.payload;
      return newState;
    },
  };

  return handlers[action.type] ? handlers[action.type](state, action) : state;
};

export default sprintReducer;
