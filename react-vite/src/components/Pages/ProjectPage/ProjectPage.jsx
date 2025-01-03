import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  selectProjectPageData,
  thunkLoadProjectData,
  selectIsLoading,
} from '../../../redux/project';

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

  return (
    <div>
      <h1>{project.name}</h1>
    </div>
  );
}

export default ProjectPage;
