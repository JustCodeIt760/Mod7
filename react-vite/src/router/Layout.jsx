import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ModalProvider, Modal } from '../context/Modal';
import { thunkAuthenticate } from '../redux/session';
import Navigation from '../components/Navigation/Navigation';
import SuperUserAgent from '../components/SuperUserAgent/SuperUserAgent';
import styles from './Layout.module.css';

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();
  const user = useSelector(state => state.session.user);

  useEffect(() => {
    dispatch(thunkAuthenticate())
      .then(() => setIsLoaded(true));
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <ModalProvider>
        {isLoaded && user ? (
          // Full-screen chat mode for logged-in users
          <SuperUserAgent />
        ) : (
          // Regular layout for login/signup pages
          <div className={styles.layout}>
            <Navigation />
            {!isLoaded ? (
              <div>Loading...</div>
            ) : (
              <main className={styles.mainContent}>
                <Outlet />
              </main>
            )}
            <Modal />
          </div>
        )}
      </ModalProvider>
    </>
  );
}
