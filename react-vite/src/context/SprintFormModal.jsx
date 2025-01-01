import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  thunkAddSprint,
  thunkRemoveSprint,
  thunkUpdateSprint,
} from '../redux/sprint';
import { useModal } from './Modal';

const SprintFormModal = ({ type = 'create', sprint = null }) => {
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const projects = useSelector(state => state.projects?.allProjects || {});

  // Use State
  const [name, setName] = useState(sprint?.name || '');
  const [description, setDescription] = useState(sprint?.description || '');
  const [projectId, setProjectId] = useState(sprint?.project_id || '');
  const [startDate, setStartDate] = useState(
    sprint?.start_date || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    sprint?.end_date || new Date().toISOString().split('T')[0]
  );
  const [createdAt, setCreatedAt] = useState(
    sprint?.created_at || new Date().toISOString().split('T')[0]
  );
  const [updatedAt, setUpdatedAt] = useState(
    sprint?.updated_at || new Date().toISOString().split('T')[0]
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Sprint name is required' }));
      return;
    }

    if (!description.trim()) {
      setErrors(prev => ({ ...prev, description: 'Description is required' }));
      return;
    }

    if (!projectId) {
      setErrors(prev => ({
        ...prev,
        project_id: 'Project selection is required',
      }));
      return;
    }

    const sprintData = {
      name: name.trim(),
      description: description.trim(),
      project_id: Number(projectId),
      start_date: startDate,
      end_date: endDate,
      created_at: new Date(createdAt).toISOString().split('T')[0],
      updated_at: new Date(updatedAt).toISOString().split('T')[0],
    };

    try {
      let result;
      if (type === 'create') {
        result = await dispatch(thunkAddSprint(sprintData));
      } else if (type === 'update') {
        result = await dispatch(
          thunkUpdateSprint({ ...sprintData, id: sprint.id })
        );
      }

      if (result?.errors) {
        setErrors(result.errors);
      } else if (result) {
        closeModal();
      } else {
        setErrors({ general: 'Failed to save sprint' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred' });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this sprint? This action cannot be undone.'
    );

    if (confirmDelete && sprint?.id) {
      try {
        const result = await dispatch(thunkRemoveSprint(sprint.id));
        if (result?.errors) {
          setErrors({ delete: result.errors });
        } else if (result) {
          closeModal();
          navigate('/sprints');
        } else {
          setErrors({ delete: 'Failed to delete sprint' });
        }
      } catch (error) {
        setErrors({ delete: 'An error occurred while deleting the sprint' });
      }
    }
  };

  return (
    <div className="sprint-form-modal">
      <h2>{type === 'create' ? 'Create New Sprint' : 'Edit Sprint'}</h2>
      {errors.general && <div className="error-message">{errors.general}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="project_id">Project</label>
          <select
            id="project_id"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            required
          >
            <option value="">Select a project</option>
            {Object.values(projects).map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.project_id && (
            <span className="error">{errors.project_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name">Sprint Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="start_date">Start Date</label>
          <input
            id="start_date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
          {errors.start_date && (
            <span className="error">{errors.start_date}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="end_date">End Date</label>
          <input
            id="end_date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
          {errors.end_date && <span className="error">{errors.end_date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="created_at">Created At</label>
          <input
            id="created_at"
            type="date"
            value={createdAt}
            onChange={e => setCreatedAt(e.target.value)}
            required
          />
          {errors.created_at && (
            <span className="error">{errors.created_at}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="updated_at">Updated At</label>
          <input
            id="updated_at"
            type="date"
            value={updatedAt}
            onChange={e => setUpdatedAt(e.target.value)}
            required
          />
          {errors.updated_at && (
            <span className="error">{errors.updated_at}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="submit">
            {type === 'create' ? 'Create Sprint' : 'Save Changes'}
          </button>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
          {type === 'update' && (
            <button
              type="button"
              onClick={handleDelete}
              className="delete-button"
            >
              Delete Sprint
            </button>
          )}
        </div>
        {errors.delete && <div className="error-message">{errors.delete}</div>}
      </form>
    </div>
  );
};

export default SprintFormModal;
