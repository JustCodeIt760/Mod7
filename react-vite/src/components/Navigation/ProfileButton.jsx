import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLogout } from '../../redux/session';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';

function ProfileButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef();
  const user = useSelector((state) => state.session.user);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const closeMenu = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const logout = (e) => {
    e.preventDefault();
    dispatch(thunkLogout());
    navigate('/');
  };

  return (
    <div className="profile-button-container" ref={buttonRef}>
      <button className="profile-button" onClick={toggleMenu}>
        <i className="fas fa-user-circle" />
      </button>
      {showMenu && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <i className="fas fa-user-circle profile-icon" />
            <div className="user-details">
              <span className="welcome">Welcome, {user?.username}</span>
              <span className="email">{user?.email}</span>
            </div>
          </div>
          <div className="dropdown-divider" />
          <button className="logout-button" onClick={logout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileButton;
