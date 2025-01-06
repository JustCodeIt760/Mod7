import { csrfFetch } from '../utils/csrf';
import { createSelector } from '@reduxjs/toolkit';

//! TO IMPLEMENT: optimistic loading, add front end ownership check for update, delete

const baseError = { server: 'Something went wrong' };

//Constants
const LOAD_FEATURES = 'features/loadFeatures';
const SET_FEATURE = 'features/setFeature';
const ADD_FEATURE = 'features/addFeature';
const UPDATE_FEATURE = 'features/updateFeature';
const REMOVE_FEATURE = 'features/removeFeature';
const MOVE_FEATURE = 'features/moveFeature';
const SET_FEATURES_BY_SPRINT = 'features/setFeaturesBySprint';
const SET_PARKING_LOT = 'features/setParkingLot';
const SET_LOADING = 'features/setLoading';
const SET_ERRORS = 'features/setErrors';

//Actions
export const loadFeatures = (featuresData) => ({
  type: LOAD_FEATURES,
  payload: featuresData,
});

export const setFeature = (feature) => ({
  type: SET_FEATURE,
  payload: feature,
});

export const addFeature = (feature) => ({
  type: ADD_FEATURE,
  payload: feature,
});

export const updateFeature = (feature) => ({
  type: UPDATE_FEATURE,
  payload: feature,
});

export const removeFeature = (featureId) => ({
  type: REMOVE_FEATURE,
  payload: featureId,
});

export const moveFeature = (featureId, sprintId) => ({
  type: MOVE_FEATURE,
  payload: { featureId, sprintId },
});

export const setFeaturesBySprint = (projectId, sprintId, features) => ({
  type: SET_FEATURES_BY_SPRINT,
  payload: { projectId, sprintId, features },
});

export const setParkingLot = (featureId) => ({
  type: SET_PARKING_LOT,
  payload: featureId,
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
export const thunkLoadFeatures = (projectId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await csrfFetch(`/projects/${projectId}/features`);
    const data = await response.json();
    dispatch(loadFeatures(data));
    dispatch(setErrors(null));
    return data;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkSetFeature =
  (projectId, featureId) => async (dispatch, getState) => {
    dispatch(setLoading(true));

    const state = getState();
    const cachedFeature = state.features.allFeatures[featureId];
    if (cachedFeature) {
      dispatch(setFeature(cachedFeature));
    }

    try {
      const response = await csrfFetch(
        `/projects/${projectId}/features/${featureId}`
      );
      const data = await response.json();
      dispatch(setFeature(data));
      dispatch(setErrors(null));
      return data;
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkAddFeature = (projectId, featureData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(`/projects/${projectId}/features`, {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
    const newFeature = await response.json();
    dispatch(addFeature(newFeature));
    dispatch(setErrors(null));
    return newFeature;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkUpdateFeature =
  (projectId, featureData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await csrfFetch(
        `/projects/${projectId}/features/${featureData.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(featureData),
        }
      );
      const updatedFeature = await response.json();
      dispatch(updateFeature(updatedFeature));
      dispatch(setErrors(null));
      return updatedFeature;
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkRemoveFeature =
  (featureId, projectId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log('Deleting feature:', { featureId, projectId }); // Debug log
      await csrfFetch(`/api/projects/${projectId}/features/${featureId}`, {
        method: 'DELETE',
      });
      dispatch(removeFeature(featureId));
      dispatch(setErrors(null));
      return true;
    } catch (error) {
      console.error('Thunk error:', error);
      dispatch(setErrors(error.errors || baseError));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

//! this needs checked to see if we can reuse the API endpoint for update or if we need a special one. patch vs put for two endpoints or?
export const thunkMoveFeature =
  (projectId, featureId, sprintId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await csrfFetch(
        `/projects/${projectId}/features/${featureId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ sprint_id: sprintId }),
        }
      );
      const updatedFeature = await response.json();
      dispatch(updateFeature(updatedFeature));
      dispatch(setErrors(null));
      return updatedFeature;
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkSetParkingLot =
  (projectId, featureId) => async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await csrfFetch(
        `/projects/${projectId}/features/${featureId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ sprint_id: null }),
        }
      );
      const updatedFeature = await response.json();
      dispatch(updateFeature(updatedFeature));
      dispatch(setErrors(null));
      return updatedFeature;
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

//Reducer

const initialState = {
  allFeatures: {},
  featuresBySprint: {},
  currentFeature: null,
  isLoading: false,
  errors: null,
};

const featureReducer = (state = initialState, action) => {
  const handlers = {
    [LOAD_FEATURES]: (state, action) => {
      const features = Array.isArray(action.payload) ? action.payload : [];

      return {
        ...state,
        allFeatures: {
          ...state.allFeatures,
          ...features.reduce(
            (acc, feature) => ({
              ...acc,
              [feature.id]: feature,
            }),
            {}
          ),
        },
      };
    },

    [SET_FEATURE]: (state, action) => {
      if (!action.payload) return state;

      return {
        ...state,
        currentFeature: action.payload,
        allFeatures: {
          ...state.allFeatures,
          [action.payload.id]: action.payload,
        },
      };
    },

    [ADD_FEATURE]: (state, action) => {
      return {
        ...state,
        allFeatures: {
          ...state.allFeatures,
          [action.payload.id]: action.payload,
        },
      };
    },

    [UPDATE_FEATURE]: (state, action) => {
      return {
        ...state,
        allFeatures: {
          ...state.allFeatures,
          [action.payload.id]: action.payload,
        },
      };
    },

    [REMOVE_FEATURE]: (state, action) => {
      const { [action.payload]: removed, ...remainingFeatures } =
        state.allFeatures;

      return {
        ...state,
        allFeatures: remainingFeatures,
      };
    },
    [MOVE_FEATURE]: (state, action) => {
      const { featureId, sprintId } = action.payload;
      const targetFeature = state.allFeatures[featureId];

      if (!targetFeature) return state;

      const updatedFeature = {
        ...targetFeature,
        sprint_id: sprintId,
      };

      return {
        ...state,
        allFeatures: {
          ...state.allFeatures,
          [featureId]: updatedFeature,
        },
        currentFeature:
          state.currentFeature?.id === featureId
            ? updatedFeature
            : state.currentFeature,
      };
    },

    [SET_FEATURES_BY_SPRINT]: (state, action) => {
      const { projectId, sprintId, features } = action.payload;

      // Create new features mapping
      const newFeatures = features.reduce(
        (acc, feature) => ({
          ...acc,
          [feature.id]: feature,
        }),
        {}
      );

      return {
        ...state,
        featuresBySprint: {
          ...state.featuresBySprint,
          [projectId]: {
            ...(state.featuresBySprint[projectId] || {}),
            [sprintId]: features,
          },
        },
        allFeatures: {
          ...state.allFeatures,
          ...newFeatures,
        },
      };
    },

    [SET_PARKING_LOT]: (state, action) => {
      const featureId = action.payload;
      const targetFeature = state.allFeatures[featureId];

      if (!targetFeature) return state;

      const updatedFeature = {
        ...targetFeature,
        sprint_id: null,
      };

      return {
        ...state,
        allFeatures: {
          ...state.allFeatures,
          [featureId]: updatedFeature,
        },
        currentFeature:
          state.currentFeature?.id === featureId
            ? updatedFeature
            : state.currentFeature,
      };
    },

    [SET_LOADING]: (state, action) => ({
      ...state,
      isLoading: action.payload,
    }),

    [SET_ERRORS]: (state, action) => ({
      ...state,
      errors: action.payload,
    }),
  };

  // Add error boundary and validation
  try {
    const handler = handlers[action.type];
    if (!handler) return state;

    // Validate payloads for relevant actions
    if ([ADD_FEATURE, UPDATE_FEATURE, SET_FEATURE].includes(action.type)) {
      if (!action.payload?.id) {
        console.warn(`Invalid payload for ${action.type}`);
        return state;
      }
    }

    if (action.type === MOVE_FEATURE) {
      if (!action.payload?.featureId || !action.payload?.sprintId) {
        console.warn('Invalid payload for MOVE_FEATURE');
        return state;
      }
    }

    if (action.type === SET_FEATURES_BY_SPRINT) {
      if (
        !action.payload?.projectId ||
        !action.payload?.sprintId ||
        !Array.isArray(action.payload?.features)
      ) {
        console.warn('Invalid payload for SET_FEATURES_BY_SPRINT');
        return state;
      }
    }

    return handler(state, action);
  } catch (error) {
    console.error(`Error in featureReducer handling ${action.type}:`, error);
    return state;
  }
};

// Memoized Selectors
export const selectAllFeatures = (state) =>
  Object.values(state.features.allFeatures);

export const selectFeaturesBySprintId = (projectId, sprintId) =>
  createSelector(
    (state) => state.features.allFeatures,
    (allFeatures) =>
      Object.values(allFeatures).filter(
        (feature) =>
          feature.project_id === projectId && feature.sprint_id === sprintId
      )
  );

export const selectParkingLotFeatures = (projectId) =>
  createSelector(
    (state) => state.features.allFeatures,
    (allFeatures) =>
      Object.values(allFeatures).filter(
        (feature) => feature.project_id === projectId && !feature.sprint_id
      )
  );

export const selectFeaturesByStatus = (status) =>
  createSelector(
    (state) => state.features.allFeatures,
    (allFeatures) =>
      Object.values(allFeatures).filter((feature) => feature.status === status)
  );

export const selectFeaturesByAssignee = (userId) =>
  createSelector(
    (state) => state.features.allFeatures,
    (allFeatures) =>
      Object.values(allFeatures).filter(
        (feature) => feature.assigned_to === userId
      )
  );

// Simple selectors (no need for memoization as they return direct values)
export const selectCurrentFeature = (state) => state.features.currentFeature;
export const selectIsLoading = (state) => state.features.isLoading;
export const selectErrors = (state) => state.features.errors;
export const selectFeaturesBySprint = (state) =>
  state.features.featuresBySprint;
export const selectFeatureById = (featureId) => (state) =>
  state.features.allFeatures[featureId];

// Memoized computed selector
export const selectFeatureCompletion = (featureId) =>
  createSelector(
    (state) => state.features.allFeatures[featureId],
    (feature) => {
      if (!feature || !feature.tasks) return 0;
      const completedTasks = feature.tasks.filter(
        (task) => task.completed
      ).length;
      return (completedTasks / feature.tasks.length) * 100;
    }
  );

export default featureReducer;
