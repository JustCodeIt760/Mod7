import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkLogin } from "../../redux/session";
import { refreshAllData } from "../../redux/shared";
import styles from "./LoginForm.module.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serverResponse = await dispatch(
        thunkLogin({
          email,
          password,
        })
      );

      if (serverResponse?.errors) {
        setErrors(serverResponse.errors);
      } else {
        await dispatch(refreshAllData());
        closeModal();
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    try {
      const serverResponse = await dispatch(
        thunkLogin({
          email: "demo@aa.io",
          password: "password"
        })
      );

      if (serverResponse?.errors) {
        setErrors(serverResponse.errors);
      } else {
        await dispatch(refreshAllData());
        closeModal();
      }
    } catch (error) {
      console.error("Demo login failed:", error);
      setErrors({ general: "Failed to log in with demo account" });
    }
  };

  return (
    <div className={styles.loginFormContainer}>
      <h1>Log In</h1>
      {errors.general && (
        <p className={styles.error}>{errors.general}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>
            Email
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.loginButton}>Log In</button>
          <button 
            type="button" 
            onClick={handleDemoLogin}
            className={styles.demoButton}
          >
            Demo User Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginFormModal;
