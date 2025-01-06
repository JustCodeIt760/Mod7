import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';
import projectReducer from './project';
import taskReducer from './task';
import sprintReducer from './sprint';
import featureReducer from './feature';
import userReducer from './user';

// Create root reducer with reset functionality
const appReducer = combineReducers({
  session: sessionReducer,
  projects: projectReducer,
  features: featureReducer,
  sprints: sprintReducer,
  tasks: taskReducer,
  users: userReducer,
});

// Root reducer that can handle store reset
const rootReducer = (state, action) => {
  // Clear all data when RESET_STORE action is dispatched
  if (action.type === 'RESET_STORE') {
    state = undefined;
  }
  return appReducer(state, action);
};

let enhancer;
if (import.meta.env.MODE === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import('redux-logger')).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
