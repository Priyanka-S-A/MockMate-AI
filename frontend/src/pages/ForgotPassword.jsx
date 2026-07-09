import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ForgotPassword is no longer in use — the platform now uses
 * Google Sign-In exclusively. This component simply redirects
 * any visitors who land on /forgot-password back to /login.
 *
 * The backend implementation is preserved and can be re-enabled
 * here at any time if email authentication is restored.
 */
const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default ForgotPassword;
