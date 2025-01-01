// TaskList.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectEnrichedTasks } from '../../../redux/task';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

function TaskList() {
  const enrichedTasks = useSelector(selectEnrichedTasks);
  const [filters, setFilters] = useState({
    priority: 'all',
    sortBy: 'dueDate',
  });

  // Filter and sort tasks
  const getFilteredTasks = () => {
    let filtered = [...enrichedTasks];

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(
        (task) =>
          task.display.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'dueDate':
          return new Date(a.due_date) - new Date(b.due_date);
        case 'priority':
          return a.priority - b.priority;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!enrichedTasks?.length) {
    return <div className={styles.noTasks}>No tasks found</div>;
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className={styles.taskList}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="sortBy">Sort by:</label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <div className={styles.taskItems}>
        {filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default TaskList;
