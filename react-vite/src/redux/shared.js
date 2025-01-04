import { thunkLoadProjects } from './project';
import { thunkLoadTasks } from './task';
import { thunkLoadSprints } from './sprint';
import { thunkLoadFeatures } from './feature';

export const refreshAllData = () => async (dispatch) => {
  try {
    // First load projects
    const projects = await dispatch(thunkLoadProjects());

    if (projects) {
      // For each project, load its sprints and features
      await Promise.all(
        Object.values(projects).flatMap((project) => [
          dispatch(thunkLoadSprints(project.id)),
          dispatch(thunkLoadFeatures(project.id)),
          // If tasks need both project and feature IDs, we'll need to wait for features
          // to load first before loading tasks
        ])
      );

      // Now get features for each project to load tasks
      for (const project of Object.values(projects)) {
        const features = await dispatch(thunkLoadFeatures(project.id));
        if (features) {
          await Promise.all(
            Object.values(features).map((feature) =>
              dispatch(thunkLoadTasks(project.id, feature.id))
            )
          );
        }
      }
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
};
