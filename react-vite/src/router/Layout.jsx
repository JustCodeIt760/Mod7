import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ModalProvider, Modal } from '../context/Modal';
import { thunkAuthenticate, selectUser } from '../redux/session';
import SideNav from '../components/SideNav';
import Navigation from '../components/Navigation/Navigation';

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useSelector(selectUser);
  useEffect(() => {
    dispatch(thunkAuthenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <ModalProvider>
        <Navigation />
        {!isLoaded ? (
          <div>Loading...</div>
        ) : (
          <>
            {user && <SideNav />}

            <main>
              <Outlet />
            </main>
          </>
        )}
        <Modal />
      </ModalProvider>
    </>
  );
}
