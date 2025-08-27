import { useSelector } from 'react-redux';
import SuperUserAgent from './SuperUserAgent/SuperUserAgent';

const HomePage = () => {
  const user = useSelector(state => state.session.user);
  
  console.log('HomePage - User:', user);
  
  if (user) {
    console.log('Rendering SuperUserAgent');
    return <SuperUserAgent />;
  }
  
  console.log('Rendering login message');
  return <div>Welcome! Please log in.</div>;
};

export default HomePage;