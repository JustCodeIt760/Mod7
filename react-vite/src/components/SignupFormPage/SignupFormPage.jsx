import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectErrors, thunkSignup } from '../../redux/session';

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
    <>
      <h1>Sign Up</h1>
      {allErrors.server && <p>{allErrors.server}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {allErrors.firstName && <p>{allErrors.firstName}</p>}
        <label>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {allErrors.lastName && <p>{allErrors.lastName}</p>}
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {allErrors.email && <p>{allErrors.email}</p>}
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {allErrors.username && <p>{allErrors.username}</p>}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {allErrors.password && <p>{allErrors.password}</p>}
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {allErrors.confirmPassword && <p>{allErrors.confirmPassword}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </>
  );
}

export default SignupFormPage;
