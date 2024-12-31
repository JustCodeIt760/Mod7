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

export const thunkRemoveFeature = (featureId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await csrfFetch(`/features/${featureId}`, {
      method: 'DELETE',
    });
    dispatch(removeFeature(featureId));
    dispatch(setErrors(null));
    return true;
  } catch (error) {
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
      const newState = { ...state };
      const features = Array.isArray(action.payload) ? action.payload : [];
      features.forEach((feature) => {
        newState.allFeatures[feature.id] = feature;
      });
      return newState;
    },
    [SET_FEATURE]: (state, action) => {
      const newState = { ...state };
      newState.currentFeature = action.payload;
      if (action.payload) {
        newState.allFeatures[action.payload.id] = action.payload;
      }
      return newState;
    },
    [ADD_FEATURE]: (state, action) => {
      const newState = { ...state };
      newState.allFeatures[action.payload.id] = action.payload;
      return newState;
    },
    [UPDATE_FEATURE]: (state, action) => {
      const newState = { ...state };
      newState.allFeatures[action.payload.id] = action.payload;
      return newState;
    },
    [REMOVE_FEATURE]: (state, action) => {
      const newState = { ...state };
      delete newState.allFeatures[action.payload.id];
      return newState;
    },
    [MOVE_FEATURE]: (state, action) => {
      const newState = { ...state };
      const { featureId, sprintId } = action.payload;
      //! updated the feature in allfeatures if it exists
      if (newState.allFeatures[featureId]) {
        newState.allFeatures[featureId] = {
          ...newState.allFeatures[featureId],
          sprint_id: sprintId,
        };
      }
      //! updated current feature if it matches the move feature
      if (newState.currentFeature?.id === featureId) {
        newState.currentFeature = {
          ...newState.currentFeature,
          sprint_id: sprintId,
        };
      }
      return newState;
    },
    [SET_FEATURES_BY_SPRINT]: (state, action) => {
      const newState = { ...state };
      const { projectId, sprintId, features } = action.payload;

      //! initialize proj if not exists
      if (!newState.featuresBySprint[projectId]) {
        newState.featuresBySprint[projectId] = {};

        //! set features for specific sprint
        newState.featuresBySprint[projectId][sprintId] = features;

        //! update all featues with the new features
        features.forEach((feature) => {
          newState.allFeatures[feature.id] = feature;
        });
        return newState;
      }
    },
    [SET_PARKING_LOT]: (state, action) => {
      const newState = { ...state };
      const featureId = action.payload;
      //! sets feature's sprint_id to null moving it into the parking lot and updates both the all feats and current feats if needed.
      if (newState.allFeatures[featureId]) {
        newState.allFeatures[featureId] = {
          ...newState.allFeatures[featureId],
          sprint_id: null,
        };
      }
      if (newState.currentFeature?.id === featureId) {
        newState.currentFeature = {
          ...newState.currentFeature,
          sprint_id: null,
        };
      }
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

// Memoized Selectors
export const selectAllFeatures = state => Object.values(state.features.allFeatures);

export const selectFeaturesBySprintId = (projectId, sprintId) =>
  createSelector(
    state => state.features.allFeatures,
    allFeatures => Object.values(allFeatures).filter(
      feature => feature.project_id === projectId && feature.sprint_id === sprintId
    )
  );

export const selectParkingLotFeatures = (projectId) =>
  createSelector(
    state => state.features.allFeatures,
    allFeatures => Object.values(allFeatures).filter(
      feature => feature.project_id === projectId && !feature.sprint_id
    )
  );

export const selectFeaturesByStatus = (status) =>
  createSelector(
    state => state.features.allFeatures,
    allFeatures => Object.values(allFeatures).filter(
      feature => feature.status === status
    )
  );

export const selectFeaturesByAssignee = (userId) =>
  createSelector(
    state => state.features.allFeatures,
    allFeatures => Object.values(allFeatures).filter(
      feature => feature.assigned_to === userId
    )
  );

// Simple selectors (no need for memoization as they return direct values)
export const selectCurrentFeature = state => state.features.currentFeature;
export const selectIsLoading = state => state.features.isLoading;
export const selectErrors = state => state.features.errors;
export const selectFeaturesBySprint = state => state.features.featuresBySprint;
export const selectFeatureById = featureId => state => state.features.allFeatures[featureId];

// Memoized computed selector
export const selectFeatureCompletion = (featureId) =>
  createSelector(
    state => state.features.allFeatures[featureId],
    feature => {
      if (!feature || !feature.tasks) return 0;
      const completedTasks = feature.tasks.filter(task => task.completed).length;
      return (completedTasks / feature.tasks.length) * 100;
    }
  );

export default featureReducer;
