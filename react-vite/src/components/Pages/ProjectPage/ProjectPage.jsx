import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  selectProjectPageData,
  thunkLoadProjectData,
  selectIsLoading,
} from '../../../redux/project';
import { selectEnrichedTasks } from '../../../redux/task'; // Changed this
import ProjectHeader from './ProjectHeader';
import ParkingLot from './ParkingLot';
import SprintSection from './SprintSection';
import ProjectMembers from './ProjectMembers';

import styles from './styles/ProjectPage.module.css';

function ProjectPage() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const projectData = useSelector((state) =>
    selectProjectPageData(state, projectId)
  );
  const enrichedTasks = useSelector(selectEnrichedTasks); // Changed this

  useEffect(() => {
    dispatch(thunkLoadProjectData(projectId));
  }, [dispatch, projectId]);

  if (isLoading) return <div>Loading...</div>;
  if (!projectData) return <div>Project not Found</div>;

  const { project, sprints, parkingLot } = projectData;

  // Create enriched tasks map
  const enrichedTasksMap = enrichedTasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {});

  // Create task normalizer function
  const normalizeTask = (task) => ({
    ...task,
    ...enrichedTasksMap[task.id],
  });

  console.log('project-data:', projectData);
  console.log('project:', project);
  console.log('parking lot:', parkingLot);
  console.log('sprints:', sprints);

  return (
    <div className={styles.projectPage}>
      <ProjectHeader project={project} />
      <ProjectMembers project={project} />

      <div className={styles.projectContent}>
        <ParkingLot
          features={parkingLot?.features || []}
          projectId={projectId}
          normalizeTask={normalizeTask}
        />
        <SprintSection
          sprints={sprints || []}
          projectId={projectId}
          normalizeTask={normalizeTask}
        />
      </div>
    </div>
  );
}

export default ProjectPage;
