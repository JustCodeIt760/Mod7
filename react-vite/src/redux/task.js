import { csrfFetch } from "../utils/csrf";

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
    const cashedTask = state.tasks.allTasks[task.id];
    if (cashedTask) {
        dispatch({
            type: SET_TASK,
            payload: cashedTask,
        });
    }
    // utilize thunk to get fresh data and update if it changes. speed of store + accuracy of new data
    try {
        const response = await csrfFetch(`/api/tasks${taskId}`);
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



const thunkAddTask = (tasksData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
        const newTask = await response.json();
        dispatch(addTask(newTask));
        dispatch(setErrors(null));
        return newTask;
    } catch (error) {
        dispatch(setErrors(error.errors || baseError));
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
        dispatch(setErrors(error.errors || baseError));
        return null;
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkRemoveTask = (taskId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/tasks/${taskId}`, {
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

};

