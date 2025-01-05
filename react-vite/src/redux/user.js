// Constants
const LOAD_USERS = 'users/LOAD_USERS';
const SET_LOADING = 'users/SET_LOADING';
const SET_ERRORS = 'users/SET_ERRORS';

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

// Initial State
const initialState = {
  allUsers: {},
  isLoading: false,
  errors: null,
};

// Reducer (exports to be used as users in store)
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_USERS:
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
