import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './SignIn.css';

// eslint-disable-next-line react/prop-types
const SignIn = ({ onSignIn }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    // Check if the user is already signed in
    const isSignedIn = localStorage.getItem('isSignedIn');
    if (isSignedIn === 'true') {
      onSignIn();
    }
  }, [onSignIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    // const auth = getAuth();
    
    try {
      // Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('isSignedIn', 'true'); 
      setLoading(false);
      onSignIn();
    } catch (error) {
      setLoading(false);
      // Handle Firebase authentication errors
      // if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      //   setErrors({ general: 'Invalid email or password' });
      // } else {
      //   setErrors({ general: 'An error occurred during sign-in. Please try again later.' });
      // }
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.email) formErrors.email = 'Email is required****';
    if (!formData.password) formErrors.password = 'Password is required****';
    return formErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className='signInComp'>
      <div className="signIn">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit} className='signInForm'>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder='Email'
          />
          {errors.email && <p className='error'>{errors.email}</p>}
          
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder='Password'
          />
          {errors.password && <p className='error'>{errors.password}</p>}
          
          {errors.general && <p className='error'>{errors.general}</p>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          {/* <p>No Account? Register <span onClick={onRegisterClick}>Here</span></p> */}
        </form>
      </div>
    </div>
  );
};

export default SignIn;
