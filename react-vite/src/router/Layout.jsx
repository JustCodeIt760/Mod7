import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ModalProvider, Modal } from '../context/Modal';
import { thunkAuthenticate, selectUser } from '../redux/session';
import { refreshAllData } from '../redux/shared';
import SideNav from '../components/SideNav';
import Navigation from '../components/Navigation/Navigation';
import styles from './Layout.module.css';

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useSelector(selectUser);
  const location = useLocation();

  useEffect(() => {
    dispatch(thunkAuthenticate())
      .then(() => dispatch(refreshAllData()))
      .then(() => setIsLoaded(true));
  }, [dispatch]); // Remove user from dependencies

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
            <>
              {user && <SideNav />}
              <main
                className={`${styles.mainContent} ${
                  user ? styles.withSideNav : ''
                }`}
              >
                <Outlet />
              </main>
            </>
          )}
          <Modal />
        </div>
      </ModalProvider>
    </>
  );
}
