import { csrfFetch } from '../utils/csrf';
import { thunkLoadProjects } from './project';
import { thunkLoadTasks } from './task';
import { thunkLoadSprints } from './sprint';
import { thunkLoadFeatures } from './feature';

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const SET_LOADING = 'session/setLoading';
const SET_ERRORS = 'session/setErrors';
const RESET_STORE = 'RESET_STORE';

const baseError = { server: 'Something went wrong' };

const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});

const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

// exported to be used publicly to reset errors in component - SG
export const setErrors = (errors) => ({
  type: SET_ERRORS,
  payload: errors,
});

export const resetStore = () => ({
  type: RESET_STORE,
});

export const thunkAuthenticate = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/auth');
    const userData = await response.json();
    dispatch(setUser(userData));

    if (userData) {
      // Just load the projects list
      await dispatch(thunkLoadProjects());
    }

    dispatch(setErrors(null));
    return userData;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkLogin = (credentials) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    dispatch(setUser(data));
    dispatch(setErrors(null));
    return data;
  } catch (err) {
    console.log('Full error:', err);

    const errorResponse = await err.json();
    dispatch(setErrors(errorResponse.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    const data = await response.json();
    dispatch(resetStore());
    dispatch(setUser(data));
    dispatch(setErrors(null));
    return data;
  } catch (err) {
    const errorData = await err.json();
    dispatch(setErrors(errorData || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkLogout = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await csrfFetch('/auth/logout');
    dispatch(resetStore());
    dispatch(removeUser());
    dispatch(setErrors(null));
    return true;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

const initialState = {
  user: null,
  isLoading: false,
  errors: null,
};

const sessionReducer = (state = initialState, action) => {
  const reducers = {
    [SET_USER]: (state, action) => ({
      ...state,
      user: action.payload,
    }),

    [REMOVE_USER]: (state) => ({
      ...state,
      user: null,
    }),

    [SET_LOADING]: (state, action) => ({
      ...state,
      isLoading: action.payload,
    }),

    [SET_ERRORS]: (state, action) => ({
      ...state,
      errors: action.payload,
    }),
  };

  return reducers[action.type]?.(state, action) || state;
};

// Selectors
export const selectUser = (state) => state.session.user;
export const selectIsLoading = (state) => state.session.isLoading;
export const selectErrors = (state) => state.session.errors;

export default sessionReducer;
