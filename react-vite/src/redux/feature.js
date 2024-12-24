import { csrfFetch } from '../utils/csrf';

const baseError = { server: 'Something went wrong' };

//! Actions  Types
const LOAD_FEATURES = 'features/loadFeatures';
const SET_FEATURE = 'features/setFeature';
const ADD_FEATURE = 'features/addFeature';
const UPDATE_FEATURE = 'features/updateFeature';
const REMOVE_FEATURE = 'features/removeFeature';
const SET_LOADING = 'features/setLoading';
const SET_ERRORS = 'features/setErrors';


