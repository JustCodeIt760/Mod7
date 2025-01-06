export const useClickOutside = (
  isActive,
  containerClassName,
  onClickOutside,
  excludeClassNames = []
) => {
  useEffect(() => {
    if (isActive) {
      const handleClickOutside = (e) => {
        const container = e.target.closest(`.${containerClassName}`);

        if (!container) {
          const isExcluded = excludeClassNames.some((className) =>
            e.target.closest(`.${className}`)
          );

          if (!isExcluded) {
            onClickOutside();
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isActive, containerClassName, onClickOutside, excludeClassNames]);
};
