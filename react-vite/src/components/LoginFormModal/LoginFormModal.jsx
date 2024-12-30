import { useEffect, useState } from 'react';
import { setErrors, thunkLogin, selectErrors } from '../../redux/session';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';
import { thunkLoadProjects } from '../../redux/project';

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
      </form>
    </>
  );
}

export default LoginFormModal;
