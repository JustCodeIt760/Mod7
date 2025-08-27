import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ModalProvider, Modal } from '../context/Modal';
import { thunkAuthenticate } from '../redux/session';
import Navigation from '../components/Navigation/Navigation';
import styles from './Layout.module.css';

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

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
      </ModalProvider>
    </>
  );
}
