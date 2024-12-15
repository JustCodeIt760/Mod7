import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import "./Navigation.css";

function Navigation() {
  const sessionUser = useSelector((state) => state.session.user);

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-left">
          <NavLink to="/" className="logo">
            <span className="logo-text">TaskFlow</span>
          </NavLink>
        </div>

        <div className="nav-right">
          {sessionUser ? (
            <>
              <NavLink to="/workspaces" className="nav-button">
                Workspaces
              </NavLink>
              <NavLink to="/create" className="nav-button">
                Create
              </NavLink>
              <ProfileButton />
            </>
          ) : (
            <OpenModalButton
              buttonText="Log In"
              modalComponent={<LoginFormModal />}
              className="nav-button"
            />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
