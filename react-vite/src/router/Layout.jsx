import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ModalProvider, Modal } from "../context/Modal";
import { thunkAuthenticate } from "../redux/session";
import Navigation from "../components/Navigation/Navigation";
import SideNav from "../components/SideNav";
import styles from './Layout.module.css';

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useSelector(state => state.session.user);

  useEffect(() => {
    dispatch(thunkAuthenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <ModalProvider>
      <div className={styles.layout}>
        <Navigation />
        {isLoaded && user && <SideNav />}
        <main className={styles.mainContent}>
          {isLoaded && <Outlet />}
        </main>
        <Modal />
      </div>
    </ModalProvider>
  );
}
