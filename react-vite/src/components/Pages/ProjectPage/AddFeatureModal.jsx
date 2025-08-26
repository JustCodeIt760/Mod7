import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkAddFeature } from '../../../redux/feature';
import styles from './styles/AddFeatureModal.module.css';

function AddFeatureModal({ isOpen, onClose, projectId }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 5
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Feature name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required for AI task generation';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Please provide a more detailed description (at least 10 characters)';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const featureData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        priority: parseInt(formData.priority),
        status: 'Not Started'
      };

      const result = await dispatch(thunkAddFeature(projectId, featureData));
      
      if (result) {
        // Reset form and close modal
        setFormData({
          name: '',
          description: '',
          priority: 5
        });
        setErrors({});
        onClose();
        
        // Show success message briefly
        console.log('✅ Feature created! AI is generating tasks...');
      }
    } catch (error) {
      console.error('Failed to create feature:', error);
      setErrors({ submit: 'Failed to create feature. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        description: '',
        priority: 5
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Feature</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Feature Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., User Authentication System"
              className={errors.name ? styles.inputError : ''}
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description for AI task generation. Example: Build a secure authentication system with email verification, password reset, multi-factor authentication, and social login options (Google, Facebook). Include session management and security audit logging."
              className={errors.description ? styles.inputError : ''}
              disabled={isSubmitting}
              rows={4}
              maxLength={500}
            />
            <div className={styles.characterCount}>
              {formData.description.length}/500 characters
            </div>
            {errors.description && <span className={styles.error}>{errors.description}</span>}
            <div className={styles.aiHint}>
              💡 <strong>AI Tip:</strong> More detailed descriptions generate better, more specific tasks!
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="priority">Priority (1-10) *</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className={errors.priority ? styles.inputError : ''}
              disabled={isSubmitting}
            >
              <option value={1}>1 - Lowest</option>
              <option value={2}>2 - Very Low</option>
              <option value={3}>3 - Low</option>
              <option value={4}>4 - Below Normal</option>
              <option value={5}>5 - Normal</option>
              <option value={6}>6 - Above Normal</option>
              <option value={7}>7 - High</option>
              <option value={8}>8 - Very High</option>
              <option value={9}>9 - Highest</option>
              <option value={10}>10 - Critical</option>
            </select>
            {errors.priority && <span className={styles.error}>{errors.priority}</span>}
          </div>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <div className={styles.modalButtons}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Creating...
                </>
              ) : (
                '🤖 Create & Generate Tasks'
              )}
            </button>
          </div>

          <div className={styles.aiInfo}>
            <div className={styles.aiInfoHeader}>
              🚀 What happens next:
            </div>
            <ol className={styles.aiSteps}>
              <li>Feature gets added to Parking Lot</li>
              <li>AI analyzes your description</li>
              <li>5-10 specific tasks are generated automatically</li>
              <li>Tasks appear in your feature (refresh in ~15 seconds)</li>
            </ol>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFeatureModal;