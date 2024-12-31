import { useEffect, useState } from 'react';
import { useModal } from './Modal';
import { useSelector } from 'react-redux';

const ProjectFormModal = ({ type = 'create', project = null }) => {
    const { closeModal } = useModal();

    const user = useSelector(state => state.session.user);

  // Use State
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [ownerId, setOwnerId] = useState(project?.owner_id || user?.id || '');
  const [createdAt, setCreatedAt] = useState(project?.created_at || new Date().toISOString().split('T')[0]);
  const [updatedAt, setUpdatedAt] = useState(project?.updated_at || new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
      e.preventDefault();
      setErrors({});

      const projectData = {
          name,
          description,
          owner_id: ownerId,
          created_at: createdAt,
          updated_at: updatedAt,
      };

      try {
          let response;
          if (type === 'create') {
              response = await fetch('/api/projects', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(projectData)
              });
          } else if (type === 'update') {
              response = await fetch(`/api/projects/${project.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(projectData)
              });
          }

          if (response.ok) {
              closeModal();
          } else {
              const data = await response.json();
              setErrors(data.errors);
          }
      } catch (error) {
          setErrors({ general: 'An error occurred' });
      }
  };

  const handleDelete = async () => {
      const confirmDelete = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');

      if (confirmDelete && project?.id) {
          try {
              const response = await fetch(`/api/projects/${project.id}`, {
                  method: 'DELETE',
              });

              if (response.ok) {
                  closeModal();
              } else {
                  const data = await response.json();
                  setErrors({ delete: data.message || 'Failed to delete project' });
              }
          } catch (error) {
              setErrors({ delete: 'An error occurred while deleting the project' });
          }
      }
  };

  return (
      <div className="project-form-modal">
          <h2>{type === 'create' ? 'Create New Project' : 'Edit Project'}</h2>
          <form onSubmit={handleSubmit}>
              <div className="form-group">
                  <label htmlFor="title">Project Name</label>
                  <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                  />
                  {errors.title && <span className="error">{errors.title}</span>}
              </div>

              <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                  />
                  {errors.description && <span className="error">{errors.description}</span>}
                  <label htmlFor="owner_id">Owner ID</label>
                  <input
                      id="owner_id"
                      type="number"
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      required
                  />
                  {errors.owner_id && <span className="error">{errors.owner_id}</span>}
                  <label htmlFor="created_at">Created At</label>
                  <input
                      id="created_at"
                      type="date"
                      value={createdAt}
                      onChange={(e) => setCreatedAt(e.target.value)}
                      required
                  />
                  {errors.created_at && <span className="error">{errors.created_at}</span>}
                  <label htmlFor="updated_at">Updated At</label>
                  <input
                      id="updated_at"
                      type="date"
                      value={updatedAt}
                      onChange={(e) => setUpdatedAt(e.target.value)}
                      required
                  />
                  {errors.updated_at && <span className="error">{errors.updated_at}</span>}
              </div>

              <div className="form-actions">
                  <button type="submit">
                      {type === 'create' ? 'Create Project' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={closeModal}>Cancel</button>
                  {type === 'update' && (
                      <button
                          type="button"
                          onClick={handleDelete}
                          className="delete-button"
                      >
                          Delete Project
                      </button>
                  )}
              </div>
              {errors.delete && (
                  <div className="error-message">{errors.delete}</div>
              )}
          </form>
      </div>
  );
}

export default ProjectFormModal;
