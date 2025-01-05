export const sortTasksWithUserPriority = (tasks, userId) => {
  return [...tasks].sort((a, b) => {
    // First sort by user assignment
    if (a.assigned_to === userId && b.assigned_to !== userId) return -1;
    if (b.assigned_to === userId && a.assigned_to !== userId) return 1;

    // Then by start date
    return new Date(a.start_date) - new Date(b.start_date);
  });
};
