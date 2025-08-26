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
import ProjectVisualizationSimple from './ProjectVisualizationSimple';

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

  // Collect all features and tasks for visualization
  const allFeatures = [
    ...(parkingLot?.features || []),
    ...(sprints?.flatMap(sprint => sprint.features || []) || [])
  ];
  
  // Get all tasks from the enriched tasks selector (already normalized)
  const allTasks = enrichedTasks;


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
      
      {/* PMI Project Command Center - Test */}
      <div style={{ background: 'white', padding: '2rem', margin: '2rem 0', border: '1px solid #ccc' }}>
        <h2>Project Visualization Debug</h2>
        <p>Project: {project?.name || 'No project'}</p>
        <p>Sprints: {sprints?.length || 0}</p>
        <p>Features: {allFeatures?.length || 0}</p>
        <p>Tasks: {allTasks?.length || 0}</p>
      </div>
      
      <ProjectVisualizationSimple
        project={project}
        sprints={sprints || []}
        features={allFeatures}
        tasks={allTasks}
      />
    </div>
  );
}

export default ProjectPage;
