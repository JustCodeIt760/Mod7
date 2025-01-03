import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLoadProjects, selectAllProjects } from '../../../redux/project';
import { thunkLoadFeatures } from '../../../redux/feature';
import TaskList from './TaskList';
import styles from './TasksPage.module.css';

function TasksPage() {
  const dispatch = useDispatch();
  const projects = useSelector(selectAllProjects);

  useEffect(() => {
    dispatch(thunkLoadProjects());
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(projects).length > 0) {
      Object.values(projects).forEach((project) => {
        dispatch(thunkLoadFeatures(project.id));
      });
    }
  }, [dispatch, Object.keys(projects).length]);

  return (
    <div className={styles.tasksPage}>
      <header className={styles.pageHeader}>
        <h1>My Tasks</h1>
      </header>
      <TaskList />
    </div>
  );
}

export default TasksPage;
