import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  selectProjectPageData,
  thunkLoadProjectData,
  selectIsLoading,
} from '../../../redux/project';
import ProjectHeader from './ProjectHeader';
import ParkingLot from './ParkingLot';
import SprintSection from './SprintSection';
import styles from './ProjectPage.module.css';

function ProjectPage() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const projectData = useSelector((state) =>
    selectProjectPageData(state, projectId)
  );
  useEffect(() => {
    dispatch(thunkLoadProjectData(projectId));
  }, [dispatch, projectId]);
  if (isLoading) return <div>Loading...</div>;
  if (!projectData) return <div>Project not Found</div>;
  const { project, sprints, parkingLot } = projectData;
  console.log(project);
  console.log(sprints);
  console.log(parkingLot);
  console.log(projectData);
  return (
    <div className={styles.projectPage}>
      <ProjectHeader project={project} />

      <div className={styles.projectContent}>
        <ParkingLot features={parkingLot?.features || []} />
        <SprintSection sprints={sprints || []} projectId={projectId} />
      </div>
    </div>
  );
}

export default ProjectPage;
