import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  thunkAddProject,
  thunkRemoveProject,
  thunkUpdateProject,
} from '../redux/project';
import { useModal } from './Modal';

const ProjectFormModal = ({ type = 'create', project = null }) => {
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);

  // Use State
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [dueDate, setDueDate] = useState(
    project?.due_date || new Date().toISOString().split('T')[0]
  );
  const [createdAt, setCreatedAt] = useState(
    project?.created_at || new Date().toISOString().split('T')[0]
  );
  const [updatedAt, setUpdatedAt] = useState(
    project?.updated_at || new Date().toISOString().split('T')[0]
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Project name is required' }));
      return;
    }

    if (!description.trim()) {
      setErrors((prev) => ({
        ...prev,
        description: 'Description is required',
      }));
      return;
    }

    const projectData = {
      name: name.trim(),
      description: description.trim(),
      due_date: dueDate,
    };

    try {
      let result;
      if (type === 'create') {
        result = await dispatch(thunkAddProject(projectData));
      } else if (type === 'update') {
        result = await dispatch(
          thunkUpdateProject({ ...projectData, id: project.id })
        );
      }

      if (result?.errors) {
        setErrors(result.errors);
      } else if (result) {
        closeModal();
      } else {
        setErrors({ general: 'Failed to save project' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred' });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.'
    );

    if (confirmDelete && project?.id) {
      try {
        const result = await dispatch(thunkRemoveProject(project.id));
        if (result?.errors) {
          setErrors({ delete: result.errors });
        } else if (result) {
          closeModal();
          navigate('/projects');
        } else {
          setErrors({ delete: 'Failed to delete project' });
        }
      } catch (error) {
        setErrors({ delete: 'An error occurred while deleting the project' });
      }
    }
  };

  return (
    <div>
      <h2>{type === 'create' ? 'Create New Project' : 'Edit Project'}</h2>
      {errors.general && <div className="error-message">{errors.general}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Project Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
          <label htmlFor="due_date">Due Date</label>
          <input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          {errors.due_date && <span className="error">{errors.due_date}</span>}
        </div>

        <div className="form-actions">
          <button type="submit">Create Project</button>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
        </div>
        {errors.delete && <div className="error-message">{errors.delete}</div>}
      </form>
    </div>
  );
}; // Added closing brace and semicolon

export default ProjectFormModal;
