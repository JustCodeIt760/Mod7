import React from 'react';
import styles from './TaskFilters.module.css';

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Created Date' },
];

function TaskFilters({ activeFilters, onFilterChange }) {
  const handlePriorityChange = (e) => {
    onFilterChange({ priority: e.target.value });
  };

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGroup}>
        <label htmlFor="priority" className={styles.filterLabel}>
          Priority:
        </label>
        <select
          id="priority"
          value={activeFilters.priority}
          onChange={handlePriorityChange}
          className={styles.select}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="sort" className={styles.filterLabel}>
          Sort by:
        </label>
        <select
          id="sort"
          value={activeFilters.sortBy}
          onChange={handleSortChange}
          className={styles.select}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TaskFilters;
