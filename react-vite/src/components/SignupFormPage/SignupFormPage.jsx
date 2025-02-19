// SignupFormPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectErrors, thunkSignup } from '../../redux/session';
import './SignupForm.css';

function SignupFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErrors, setLocalErrors] = useState({});
  const serverErrors = useSelector(selectErrors);

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setLocalErrors({
        confirmPassword:
          'Confirm Password field must be the same as the Password field',
      });
      return;
    }

    setLocalErrors({});

    const serverResponse = await dispatch(
      thunkSignup({
        first_name: firstName,
        last_name: lastName,
        email,
        username,
        password,
      })
    );
  };

  const allErrors = {
    ...serverErrors?.errors,
    ...localErrors,
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-header">Sign Up</h1>
        {allErrors.server && (
          <p className="error-message">{allErrors.server}</p>
        )}
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                First Name
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              {allErrors.firstName && (
                <p className="error-message">{allErrors.firstName}</p>
              )}
            </div>
            <div className="form-group">
              <label>
                Last Name
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
              {allErrors.lastName && (
                <p className="error-message">{allErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            {allErrors.email && (
              <p className="error-message">{allErrors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            {allErrors.username && (
              <p className="error-message">{allErrors.username}</p>
            )}
          </div>

          <div className="form-group">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {allErrors.password && (
              <p className="error-message">{allErrors.password}</p>
            )}
          </div>

          <div className="form-group">
            <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            {allErrors.confirmPassword && (
              <p className="error-message">{allErrors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupFormPage;
