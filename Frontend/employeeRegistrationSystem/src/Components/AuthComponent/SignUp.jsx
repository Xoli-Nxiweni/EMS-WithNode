import './SignUp.css';
import { useState } from 'react';

// eslint-disable-next-line react/prop-types
const SignUp = ({ onSignInClick }) => {
  const [formData, setFormData] = useState({ username: '', password: '', repeatPassword: '' });
  const [errors, setErrors] = useState({});
  const [isSignedUp, setIsSignedUp] = useState(false);

  const handleSignUp = (e) => {
    e.preventDefault();
    const { username, password, repeatPassword } = formData;

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (password === repeatPassword) {
      // Store user credentials in localStorage
      localStorage.setItem('userCredentials', JSON.stringify({ username, password }));
      setIsSignedUp(true);
      setTimeout(() => {
        onSignInClick();
      }, 2000); 
    } else {
      alert('Passwords do not match');
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.username) formErrors.username = 'Username is required***';
    if (!formData.password) formErrors.password = 'Password is required***';
    if (!formData.repeatPassword) formErrors.repeatPassword = 'Repeat password is required***';
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
    <div className="wrapper">
      <div className='signUp'>
        <h1>Sign up</h1>
        <form onSubmit={handleSignUp} className='signUpForm'>
          <input
            type="text"
            name="username"
            placeholder='Username'
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className='error'>{errors.username}</p>}
          <input
            type="password"
            name="password"
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className='error'>{errors.password}</p>}
          <input
            type="password"
            name="repeatPassword"
            placeholder='Repeat password'
            value={formData.repeatPassword}
            onChange={handleChange}
          />
          {errors.repeatPassword && <p className='error'>{errors.repeatPassword}</p>}
          <button type="submit">SIGN UP</button>
          {isSignedUp && <p>Registration successful! You can now sign in.</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
