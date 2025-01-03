// Predefined colors for team members (vibrant and pale versions)
export const TEAM_COLORS = [
  { vibrant: '#FF6B6B', pale: 'rgba(255, 107, 107, 0.25)' }, // Coral Red
  { vibrant: '#4ECDC4', pale: 'rgba(78, 205, 196, 0.25)' }, // Turquoise
  { vibrant: '#45B7D1', pale: 'rgba(69, 183, 209, 0.25)' }, // Sky Blue
  { vibrant: '#96CEB4', pale: 'rgba(150, 206, 180, 0.25)' }, // Sage Green
  { vibrant: '#9B59B6', pale: 'rgba(155, 89, 182, 0.25)' }, // Purple
  { vibrant: '#3498DB', pale: 'rgba(52, 152, 219, 0.25)' }, // Blue
  { vibrant: '#E67E22', pale: 'rgba(230, 126, 34, 0.25)' }, // Orange
  { vibrant: '#2ECC71', pale: 'rgba(46, 204, 113, 0.25)' }, // Green
  { vibrant: '#F1C40F', pale: 'rgba(241, 196, 15, 0.25)' }, // Yellow
  { vibrant: '#E74C3C', pale: 'rgba(231, 76, 60, 0.25)' }, // Red
];

// Store color assignments for team members
const teamMemberColors = new Map();

// Get a color for a team member based on their index
export const getTeamMemberColor = (index) => {
  return TEAM_COLORS[index % TEAM_COLORS.length];
};

// Assign colors to team members
export const assignTeamMemberColors = (tasks) => {
  // Clear existing assignments if no tasks
  if (!tasks || tasks.length === 0) {
    teamMemberColors.clear();
    return new Map();
  }

  // Get unique assigned team members
  const assignedMembers = new Set(
    tasks
      .filter(task => task.assigned_to)
      .map(task => task.assigned_to)
  );

  // Remove colors for members who no longer have tasks
  for (const [memberId] of teamMemberColors) {
    if (!assignedMembers.has(memberId)) {
      teamMemberColors.delete(memberId);
    }
  }

  // Assign colors to members who don't have one yet
  let colorIndex = teamMemberColors.size;
  assignedMembers.forEach(memberId => {
    if (!teamMemberColors.has(memberId)) {
      teamMemberColors.set(memberId, getTeamMemberColor(colorIndex));
      colorIndex++;
    }
  });

  return teamMemberColors;
};

// Get colors for a specific team member
export const getAssignedMemberColors = (memberId) => {
  return teamMemberColors.get(memberId) || {
    vibrant: '#CCCCCC',
    pale: 'rgba(204, 204, 204, 0.25)'
  }; // Default gray for unassigned
};