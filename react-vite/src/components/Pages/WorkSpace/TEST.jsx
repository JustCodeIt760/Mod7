import { useDispatch, useSelector } from 'react-redux';
import { thunkAddTask } from '../../../redux/task';

export const TestThunk = () => {
  const dispatch = useDispatch();
  const project = useSelector((state) => state.projects.allProjects[2]);
  const feature = useSelector((state) => state.features.allFeatures[10]);

  const testTask = {
    name: 'Test Task Name',
    description: 'Test Description',
    status: 'Not Started',
    priority: 0,
    // ISO format dates
    start_date: '2026-01-20T00:00:00Z', // or new Date().toISOString()
    due_date: '2026-01-27T00:00:00Z', // or new Date().toISOString()
    assigned_to: null,
  };

  const handleTest = async () => {
    if (!project || !feature) {
      console.error('Missing project or feature');
      return;
    }

    console.log('Sending request with:', {
      projectId: project.id,
      featureId: feature.id,
      taskData: testTask,
    });

    try {
      const result = await dispatch(
        thunkAddTask(project.id, feature.id, testTask)
      );
      console.log('Server response:', result);
    } catch (err) {
      console.error('Error details:', err);
    }
  };

  return (
    <div>
      <button onClick={handleTest} disabled={!project || !feature}>
        Test Add Task
      </button>
    </div>
  );
};

export default TestThunk;
