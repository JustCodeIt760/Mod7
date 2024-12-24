import { csrfFetch } from '../utils/csrf';

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
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
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
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
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
  (projectId, featureId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await csrfFetch(
        `/projects/${projectId}/features/${featureId}`,
        {
          method: 'DELETE',
        }
      );
      dispatch(removeFeature(featureId));
      dispatch(setErrors(null));
      return true;
    } catch (err) {
      dispatch(setErrors(err.errors || baseError));
      return null;
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
