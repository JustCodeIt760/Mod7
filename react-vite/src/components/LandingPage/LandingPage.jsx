import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/session';
import { FaListCheck, FaUserGroup, FaChartLine } from 'react-icons/fa6';

import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleSignUp = () => {
    //Redirect to signup page
    navigate('/signup');
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    featuresSection.scrollIntoView({ behavior: 'smooth' });
  };
  if (user) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Transform Your Workflow</h1>
          <p className="hero-subtitle">
            A powerful tool for managing tasks, projects, & teamwork
            effortlessly
          </p>
          <div className="hero-buttons">
            {!user && (
              <button className="primary-button" onClick={handleSignUp}>
                Sign up Free
              </button>
            )}
            <button className="secondary-button" onClick={handleLearnMore}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="board-preview">
            <div className="column">
              <div className="column-header">Backlog</div>
              <div className="task-card">Research market trends</div>
              <div className="task-card">Update documentation</div>
            </div>
            <div className="column">
              <div className="column-header">Design</div>
              <div className="task-card">Create wireframes</div>
              <div className="task-card">Design system</div>
            </div>
            <div className="column">
              <div className="column-header">To Do</div>
              <div className="task-card">Setup project</div>
              <div className="task-card">Initial planning</div>
            </div>
            <div className="column">
              <div className="column-header">In Progress</div>
              <div className="task-card">Frontend development</div>
              <div className="task-card">API integration</div>
            </div>
            <div className="column">
              <div className="column-header">Code Review</div>
              <div className="task-card">Review PR #123</div>
              <div className="task-card">Testing</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2>Why Choose TaskFlow?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaListCheck />
            </div>
            <h3>Intuitive Task Management</h3>
            <p>Organize tasks with our drag-and-drop interface</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaUserGroup />
            </div>
            <h3>Team Collaboration</h3>
            <p>Work together seamlessly with real-time updates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Progress Tracking</h3>
            <p>Monitor project progress with visual analytics</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
