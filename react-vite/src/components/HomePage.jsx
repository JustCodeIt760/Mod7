import { useSelector } from 'react-redux';

const HomePage = () => {
  const user = useSelector(state => state.session.user);
  
  console.log('HomePage - User:', user);
  
  if (user) {
    console.log('User logged in - SuperUserAgent handled by Layout');
    return null; // SuperUserAgent is now rendered by Layout
  }
  
  console.log('Rendering login message');
  return <div>Welcome! Please log in.</div>;
};

export default HomePage;