import { useSelector } from 'react-redux';

const useAuth = () => {
  const { user, token, isLoading } = useSelector((state) => state.auth);
  
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  
  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading,
  };
};

export default useAuth;