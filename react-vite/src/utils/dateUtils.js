import { isSameDay, differenceInDays, parseISO } from 'date-fns';

export const parseTaskDate = (dateString) => {
  if (!dateString) return null;
  return parseISO(dateString);
};

export const calculateTaskDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const diffHours = differenceInDays(end, start) * 24;

  if (diffHours >= 12) {
    return Math.ceil(diffHours / 24);
  }
  return Math.ceil(diffHours);
};

export const getTaskPosition = (task, days) => {
  const startDate = parseTaskDate(task.start_date);
  const endDate = parseTaskDate(task.due_date);
  const totalDays = days.length;

  const startDay = days.findIndex((day) => isSameDay(day, startDate));
  const endDay = days.findIndex((day) => isSameDay(day, endDate));

  return {
    left: `${(startDay / totalDays) * 100}%`,
    width: `${((endDay - startDay + 1) / totalDays) * 100}%`,
  };
};
