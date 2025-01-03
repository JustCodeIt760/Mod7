import { thunkLoadProjects } from './project';
import { thunkLoadTasks } from './task';
import { thunkLoadSprints } from './sprint';
import { thunkLoadFeatures } from './feature';

export const refreshAllData = () => async (dispatch) => {
  try {
    const [projects] = await Promise.all([
      dispatch(thunkLoadProjects()),
      dispatch(thunkLoadTasks()),
      dispatch(thunkLoadSprints()),
    ]);

    if (projects) {
      await Promise.all(
        Object.values(projects).map((project) =>
          dispatch(thunkLoadFeatures(project.id))
        )
      );
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
};
