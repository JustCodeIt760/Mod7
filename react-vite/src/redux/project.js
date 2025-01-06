import { createSelector } from '@reduxjs/toolkit';
import { csrfFetch } from '../utils/csrf';
import { loadFeatures } from './feature';
import { loadSprints } from './sprint';
import { loadTasks } from './task';
import { loadUsers } from './user';
import { format } from 'date-fns';

//! TO IMPLEMENT: optimistic loading, add front end ownership check for update, delete

// baseError to send back if there is no error response from the csrfFetch
const baseError = { server: 'Something went wrong' };
//Constants

const LOAD_PROJECTS = 'projects/loadProjects';
const SET_PROJECT = 'projects/setProject';
const ADD_PROJECT = 'projects/addProject';
const UPDATE_PROJECT = 'projects/updateProject';
const REMOVE_PROJECT = 'projects/removeProject';
const SET_LOADING = 'projects/setLoading';
const SET_ERRORS = 'projects/setErrors';

//Actions

export const loadProjects = (projectsData) => ({
  type: LOAD_PROJECTS,
  payload: projectsData,
});

export const setProject = (project) => ({
  type: SET_PROJECT,
  payload: project,
});

export const addProject = (project) => ({
  type: ADD_PROJECT,
  payload: project,
});

export const updateProject = (project) => ({
  type: UPDATE_PROJECT,
  payload: project,
});

export const removeProject = (projectId) => ({
  type: REMOVE_PROJECT,
  payload: projectId,
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

export const thunkLoadProjects = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/projects');
    const data = await response.json();
    dispatch(loadProjects(data.projects));
    dispatch(setErrors(null));
    return data.projects;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkLoadProjectData = (projectId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log('Loading data for project:', projectId);

    // Load project
    const projectResponse = await csrfFetch(`/projects/${projectId}`);
    const projectData = await projectResponse.json();
    console.log('Project data received:', projectData);
    dispatch(setProject(projectData));

    // Load users for the project
    const usersResponse = await csrfFetch(`/projects/${projectId}/users`);
    const usersData = await usersResponse.json();
    console.log('Users data received:', usersData);
    dispatch(loadUsers(usersData.users));

    // Load features
    const featuresResponse = await csrfFetch(`/projects/${projectId}/features`);
    const featuresData = await featuresResponse.json();
    console.log('Features data received:', featuresData);
    dispatch(loadFeatures(featuresData));

    // Load sprints
    const sprintsResponse = await csrfFetch(`/projects/${projectId}/sprints`);
    const sprintsData = await sprintsResponse.json();
    console.log('Sprints data received:', sprintsData);
    dispatch(loadSprints(sprintsData));

    // Load tasks for each feature
    console.log('Number of features to load tasks for:', featuresData.length);
    for (const feature of featuresData) {
      const tasksResponse = await csrfFetch(
        `/projects/${projectId}/features/${feature.id}/tasks`
      );
      const tasksData = await tasksResponse.json();
      console.log(`Tasks for feature ${feature.id}:`, tasksData);
      dispatch(loadTasks(tasksData));
    }

    // Log final state
    console.log('All data loaded successfully');
    dispatch(setErrors(null));
  } catch (err) {
    console.error('Error in thunkLoadProjectData:', err);
    dispatch(setErrors(err.errors || baseError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkSetProject = (projectId) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  // using getState() to quickly pull the project by ID if it exists from our store
  const state = getState();
  const cachedProject = state.projects.allProjects[projectId];
  if (cachedProject) {
    dispatch(setProject(cachedProject));
  }
  // utilize thunk to get fresh data and update if it changes. speed of store + accuracy of new data
  try {
    const response = await csrfFetch(`/projects/${projectId}`);
    const data = await response.json();
    dispatch(setProject(data));
    dispatch(setErrors(null));
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkAddProject = (projectData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });

    const data = await response.json();

    if (response.ok) {
      dispatch(addProject(data));
      // Add the owner as a project member
      await dispatch(thunkAddProjectMember(data.id, data.owner_id));
      dispatch(setErrors(null));
      return data;
    } else {
      dispatch(setErrors(data.errors));
      return { errors: data.errors };
    }
  } catch (err) {
    const errorData = await err.json?.();
    dispatch(setErrors(errorData?.errors || baseError));
    return { errors: errorData?.errors || baseError };
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkUpdateProject = (projectData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await csrfFetch(`/projects/${projectData.id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    const updatedProject = await response.json();
    dispatch(updateProject(updatedProject));
    dispatch(setErrors(null));
    return updatedProject;
  } catch (err) {
    dispatch(setErrors(err.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkRemoveProject = (projectId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await csrfFetch(`/projects/${projectId}`, {
      method: 'DELETE',
    });
    dispatch(removeProject(projectId));
    dispatch(setErrors(null));
    return true;
  } catch (error) {
    dispatch(setErrors(error.errors || baseError));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const thunkAddProjectMember =
  (projectId, userId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log('Adding member:', { projectId, userId }); // Debug log
      const response = await csrfFetch(
        `/projects/${projectId}/members/${userId}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0] || 'Failed to add member');
      }

      const data = await response.json();
      dispatch(updateProject(data));
      dispatch(setProject(data));
      dispatch(thunkLoadProjectData(projectId));
      return data;
    } catch (error) {
      console.error('Add member error:', error);
      dispatch(setErrors(error.message || baseError));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const thunkRemoveProjectMember =
  (projectId, userId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await csrfFetch(
        `/api/projects/${projectId}/members/${userId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      const updatedProject = await response.json();

      // Update both allProjects and singleProject
      dispatch(updateProject(updatedProject));
      dispatch(setProject(updatedProject));

      // Reload project data to ensure all related data is fresh
      dispatch(thunkLoadProjectData(projectId));

      dispatch(setErrors(null));
      return true;
    } catch (error) {
      console.error('Remove member error:', error);
      dispatch(setErrors(error.errors || baseError));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Initial state object defining the structure of the project state
const initialState = {
  allProjects: {}, // Object to store all projects, keyed by project ID
  singleProject: null, // Currently selected/active project
  isLoading: false, // Flag to track loading state
  errors: null, // Store any error messages
};

// Reducer function to handle state changes based on dispatched actions
const projectReducer = (state = initialState, action) => {
  const handlers = {
    [LOAD_PROJECTS]: (state, action) => {
      // Convert array to object in single operation
      const newProjects = action.payload.reduce(
        (acc, project) => ({
          ...acc,
          [project.id]: project,
        }),
        {}
      );

      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          ...newProjects,
        },
      };
    },

    [SET_PROJECT]: (state, action) => {
      if (!action.payload) {
        return state;
      }

      return {
        ...state,
        singleProject: action.payload,
        allProjects: {
          ...state.allProjects,
          [action.payload.id]: action.payload,
        },
      };
    },

    [ADD_PROJECT]: (state, action) => {
      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          [action.payload.id]: action.payload,
        },
      };
    },

    [UPDATE_PROJECT]: (state, action) => {
      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          [action.payload.id]: action.payload,
        },
        singleProject: action.payload,
      };
    },

    [REMOVE_PROJECT]: (state, action) => {
      const { [action.payload]: removed, ...remainingProjects } =
        state.allProjects;

      return {
        ...state,
        allProjects: remainingProjects,
        singleProject: null,
      };
    },

    [SET_LOADING]: (state, action) => {
      return {
        ...state,
        isLoading: action.payload,
      };
    },

    [SET_ERRORS]: (state, action) => {
      return {
        ...state,
        errors: action.payload,
      };
    },
  };

  // Add error boundary and validation
  try {
    const handler = handlers[action.type];
    if (!handler) return state;

    // Validate payload for relevant actions
    if ([ADD_PROJECT, UPDATE_PROJECT, SET_PROJECT].includes(action.type)) {
      if (!action.payload?.id) {
        console.warn(`Invalid payload for ${action.type}`);
        return state;
      }
    }

    return handler(state, action);
  } catch (error) {
    console.error(`Error in projectReducer handling ${action.type}:`, error);
    return state;
  }
};
//Selectors
export const selectAllProjects = (state) => state.projects.allProjects;
export const selectCurrentProject = (state) => state.projects.singleProject;
export const selectIsLoading = (state) => state.projects.isLoading;
export const selectErrors = (state) => state.projects.errors;

export const selectProjectById = (projectId) =>
  createSelector([selectAllProjects], (allProjects) => allProjects[projectId]);

export const selectOwnedProjects = (userId) =>
  createSelector([selectAllProjects], (allProjects) =>
    Object.values(allProjects).filter((project) => project.owner_id === userId)
  );

export const selectMemberProjects = (userId) =>
  createSelector([selectAllProjects], (allProjects) =>
    Object.values(allProjects).filter(
      (project) =>
        project.members?.includes(userId) && project.owner_id !== userId
    )
  );

export const selectProjectsByStatus = (status) =>
  createSelector([selectAllProjects], (allProjects) =>
    Object.values(allProjects).filter((project) => project.status === status)
  );

export const selectProjectsDueWithinDays = (days) =>
  createSelector([selectAllProjects], (allProjects) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return Object.values(allProjects).filter((project) => {
      const dueDate = new Date(project.due_date);
      return dueDate <= futureDate && dueDate >= new Date();
    });
  });

export const selectEnrichedProjects = createSelector(
  [
    selectAllProjects,
    (state) => state.session.user,
    (state) => state.features.allFeatures,
    (state) => state.tasks.allTasks,
    (state) => state.sprints.allSprints,
  ],
  (projects, currentUser, features, tasks, sprints) => {
    if (!currentUser) return { owned: [], shared: [] };

    const findRelevantSprint = (projectId) => {
      const projectSprints = Object.values(sprints).filter(
        (sprint) => sprint.project_id === projectId
      );

      if (projectSprints.length === 0) return null;

      const now = new Date();

      const currentSprint = projectSprints.find((sprint) => {
        const startDate = new Date(sprint.start_date);
        const endDate = new Date(sprint.end_date);
        return startDate <= now && endDate >= now;
      });

      if (currentSprint) return currentSprint;

      const upcomingSprints = projectSprints.filter(
        (sprint) => new Date(sprint.start_date) > now
      );

      if (upcomingSprints.length > 0) {
        return upcomingSprints.reduce((earliest, sprint) => {
          const sprintStart = new Date(sprint.start_date);
          const earliestStart = new Date(earliest.start_date);
          return sprintStart < earliestStart ? sprint : earliest;
        });
      }

      return projectSprints.reduce((latest, sprint) => {
        const sprintEnd = new Date(sprint.end_date);
        const latestEnd = latest ? new Date(latest.end_date) : new Date(0);
        return sprintEnd > latestEnd ? sprint : latest;
      }, null);
    };

    const calculateProjectStats = (projectId) => {
      const projectFeatures = Object.values(features).filter(
        (feature) => feature.project_id === projectId
      );

      const projectTasks = Object.values(tasks).filter((task) =>
        projectFeatures.some((feature) => feature.id === task.feature_id)
      );

      const totalTasks = projectTasks.length;
      const overdueTasks = projectTasks.filter(
        (task) =>
          new Date(task.due_date) < new Date() && task.status !== 'Completed'
      ).length;
      const completedTasks = projectTasks.filter(
        (task) => task.status === 'Completed'
      ).length;

      const relevantSprint = findRelevantSprint(projectId);
      const sprintStatus = relevantSprint
        ? new Date(relevantSprint.end_date) < new Date()
          ? 'completed'
          : new Date(relevantSprint.start_date) > new Date()
          ? 'upcoming'
          : 'in-progress'
        : 'no-sprint';

      return {
        totalTasks,
        overdueTasks,
        completedTasks,
        currentSprint: relevantSprint,
        sprintStatus,
        percentComplete:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      };
    };

    const enrichedProjects = Object.values(projects).map((project) => {
      const stats = calculateProjectStats(project.id);

      return {
        ...project,
        stats,
        display: {
          dueDate: new Date(project.due_date).toLocaleDateString(),
          isOverdue: new Date(project.due_date) < new Date(),
          percentComplete: stats.percentComplete,
          sprintInfo: stats.currentSprint
            ? {
                name: stats.currentSprint.name,
                status: stats.sprintStatus,
                dates: `${new Date(
                  stats.currentSprint.start_date
                ).toLocaleDateString()} - ${new Date(
                  stats.currentSprint.end_date
                ).toLocaleDateString()}`,
              }
            : null,
        },
      };
    });

    return {
      owned: enrichedProjects.filter(
        (project) => project.owner_id === currentUser.id
      ),
      shared: enrichedProjects.filter(
        (project) =>
          project.members?.includes(currentUser.id) &&
          project.owner_id !== currentUser.id
      ),
    };
  }
);

export const selectProjectPageData = createSelector(
  [
    (state, projectId) => state.projects.singleProject,
    (state) => state.features.allFeatures,
    (state) => state.tasks.allTasks,
    (state) => state.sprints.allSprints,
    (state) => state.users?.allUsers || {},
    (state, projectId) => projectId,
  ],
  (project, features, tasks, sprints, users, projectId) => {
    if (!project) return null;

    const formatDate = (dateString) => {
      try {
        return dateString ? format(new Date(dateString), 'MMM d') : '';
      } catch (error) {
        return '';
      }
    };

    const enrichFeature = (feature) => {
      const featureTasks = Object.values(tasks)
        .filter((task) => task.feature_id === feature.id)
        .map((task) => ({
          ...task,
          display: {
            dates: `${formatDate(task.start_date)} - ${formatDate(
              task.due_date
            )}`,
            priority: ['High', 'Medium', 'Low'][task.priority - 1] || 'Low',
            dueDate: new Date(task.due_date).toLocaleDateString(),
            assignedTo: users[task.assigned_to]?.full_name || 'Unassigned', // Add user info
            assignedToUser: users[task.assigned_to] || null, // Full user object if needed
          },
        }));

      return {
        ...feature,
        tasks: featureTasks,
      };
    };

    // Get parking lot features (features with no sprint assigned)
    const parkingLotFeatures = Object.values(features)
      .filter(
        (feature) =>
          feature.project_id === parseInt(projectId) && !feature.sprint_id
      )
      .map(enrichFeature);

    // Get sprints with their features and tasks
    const projectSprints = Object.values(sprints)
      .filter((sprint) => sprint.project_id === parseInt(projectId))
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .map((sprint) => ({
        ...sprint,
        features: Object.values(features)
          .filter(
            (feature) =>
              feature.project_id === parseInt(projectId) &&
              feature.sprint_id === sprint.id
          )
          .map(enrichFeature),
        display: {
          dates: `${formatDate(sprint.start_date)} - ${formatDate(
            sprint.end_date
          )}`,
        },
      }));

    return {
      project,
      sprints: projectSprints,
      parkingLot: {
        features: parkingLotFeatures,
      },
    };
  }
);

export default projectReducer;
