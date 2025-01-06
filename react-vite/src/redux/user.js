import { csrfFetch } from '../utils/csrf';

// Constants
const LOAD_USERS = 'users/LOAD_USERS';
const SET_LOADING = 'users/SET_LOADING';
const SET_ERRORS = 'users/SET_ERRORS';
const SET_SITE_USERS = 'users/setSiteUsers';

const baseError = { server: 'Something went wrong' };

// Action Creators
export const loadUsers = (users) => ({
  type: LOAD_USERS,
  payload: users,
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setErrors = (errors) => ({
  type: SET_ERRORS,
  payload: errors,
});

export const setSiteUsers = (users) => ({
  type: SET_SITE_USERS,
  payload: users,
});

// Thunk
export const thunkLoadProjectUsers = (projectId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log('IN THUNK:', projectId);
    const response = await csrfFetch(`/projects/${projectId}/users`);
    const data = await response.json();
    console.log('project USERS:', data);
    dispatch(loadUsers(data.users));
    return null;
  } catch (err) {
    dispatch(setErrors(err.errors || { message: 'Failed to load users' }));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkGetAllUsers = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/users');
    const data = await response.json();
    dispatch(setSiteUsers(data.users)); // Use new action
    return data;
  } catch (error) {
    dispatch(setErrors(error.errors || baseError));
  } finally {
    dispatch(setLoading(false));
  }
};

const initialState = {
  allUsers: {}, // Keep existing project users untouched
  siteUsers: {}, // New section for all site users
  isLoading: false,
  errors: null,
};

// Your reducer with new case
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_USERS: // Keep existing case exactly the same
      return {
        ...state,
        allUsers: action.payload.reduce(
          (acc, user) => ({
            ...acc,
            [user.id]: user,
          }),
          {}
        ),
        errors: null,
      };

    case SET_SITE_USERS: // Add new case
      return {
        ...state,
        siteUsers: action.payload.reduce(
          (acc, user) => ({
            ...acc,
            [user.id]: user,
          }),
          {}
        ),
      };

    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case SET_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    default:
      return state;
  }
};

export default userReducer;
