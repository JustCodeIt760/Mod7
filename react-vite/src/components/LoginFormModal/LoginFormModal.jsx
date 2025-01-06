import { useEffect, useState } from 'react';
import { setErrors, thunkLogin, selectErrors } from '../../redux/session';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';
import { thunkLoadProjects } from '../../redux/project';
import { thunkLoadTasks } from '../../redux/task';
import { thunkLoadFeatures } from '../../redux/feature';
import { thunkLoadSprints } from '../../redux/sprint';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const errors = useSelector(selectErrors);
  const { closeModal } = useModal();

  useEffect(() => {
    return () => {
      dispatch(setErrors(null));
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email,
        password,
      })
    );

    if (serverResponse) {
      dispatch(thunkLoadProjects());
      dispatch(thunkLoadTasks());
      dispatch(thunkLoadFeatures());
      dispatch(thunkLoadSprints());
      closeModal();
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    const serverResponse = await dispatch(
      thunkLogin({
        email: "demo@aa.io",
        password: "password"
      })
    );

    if (serverResponse) {
      dispatch(thunkLoadProjects());
      dispatch(thunkLoadTasks());
      dispatch(thunkLoadFeatures());
      dispatch(thunkLoadSprints());
      closeModal();
    }
  };

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors?.email && <p>{errors.email}</p>}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors?.password && <p>{errors.password}</p>}
        <button type="submit">Log In</button>
        <button type="demo-button" onClick={handleDemoLogin}>
          Demo User Login
        </button>
      </form>
    </>
  );
}

export default LoginFormModal;
