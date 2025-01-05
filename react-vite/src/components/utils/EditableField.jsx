import { useState, useEffect } from 'react';
import styles from './styles/EditableField.module.css';

function EditableField({
  value,
  onSave,
  isEditing,
  setIsEditing,
  className = '',
  containerClassName,
  excludeClassNames = [],
  modalClasses = [], // Add modalClasses prop with default empty array
}) {
  useEffect(() => {
    if (isEditing) {
      const handleClickOutside = (e) => {
        // Check for modal clicks first
        const isModalClick = modalClasses.some((className) =>
          e.target.closest(`.${className}`)
        );

        if (isModalClick) {
          return; // Don't handle clicks inside modal
        }

        const container = containerClassName
          ? e.target.closest(`.${containerClassName}`)
          : e.target.closest(`.${styles.content}`);

        if (!container) {
          const isExcluded = excludeClassNames.some((className) =>
            e.target.closest(`.${className}`)
          );

          if (!isExcluded) {
            setIsEditing(false);
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [
    isEditing,
    setIsEditing,
    containerClassName,
    excludeClassNames,
    modalClasses,
  ]);

  const handleEdit = (e) => {};

  const handleBlur = async (e) => {
    const newValue = e.target.innerText;
    if (newValue !== value) {
      await onSave(newValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <span
      contentEditable={isEditing}
      onInput={handleEdit}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning={true}
      className={`${styles.content} ${className} ${
        isEditing ? styles.editing : ''
      }`}
    >
      {value}
    </span>
  );
}

export default EditableField;
