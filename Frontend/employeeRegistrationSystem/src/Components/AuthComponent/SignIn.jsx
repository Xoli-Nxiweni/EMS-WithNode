// import { useState, useEffect } from 'react';
// import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from '../../firebase'; // Import your Firestore db
// import './SignIn.css';

// // eslint-disable-next-line react/prop-types
// const SignIn = ({ onSignIn }) => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // Listen for changes to the authentication state
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // User is signed in, check their role
//         checkUserRole(user.uid);
//       }
//     });

//     // Cleanup subscription on unmount
//     return () => unsubscribe();
//   }, []);

//   // Check user role in Firestore
//   const checkUserRole = async (uid) => {
//     console.log('Checking role for UID:', uid); // Log the UID
//     try {
//         const userDoc = await getDoc(doc(db, 'users', uid));
//         if (userDoc.exists()) {
//             const userData = userDoc.data();
//             console.log('User data retrieved:', userData); // Log user data
//             onSignIn(); // Call onSignIn after checking role
//         } else {
//             console.error('No user document found for UID:', uid);
//             setErrors({ general: 'User not found. Please check your credentials.' });
//         }
//     } catch (error) {
//         console.error('Error fetching user role:', error);
//         setErrors({ general: 'An error occurred while checking user role.' });
//     }
// };


//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { email, password } = formData;

//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }

//     setLoading(true);

//     try {
//       // Firebase authentication
//       await signInWithEmailAndPassword(auth, email, password);
//       const user = auth.currentUser; // Get the current user after successful sign-in
//       if (user) {
//         checkUserRole(user.uid);
//       }
//     } catch (error) {
//       console.error('Sign-in error:', error);
//       handleAuthError(error);
//     } finally {
//       setLoading(false); // Ensure loading state is set back to false
//     }
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     // Clear errors when user starts typing
//     setErrors((prev) => ({ ...prev, [name]: undefined }));
//   };

//   // Validate form inputs
//   const validateForm = () => {
//     let formErrors = {};
//     if (!formData.email) formErrors.email = 'Email is required';
//     if (!formData.password) formErrors.password = 'Password is required';
//     return formErrors;
//   };

//   // Handle error messages based on Firebase Auth error codes
//   const handleAuthError = (error) => {
//     if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
//       setErrors({ general: 'Invalid email or password' });
//     } else {
//       setErrors({ general: 'An error occurred during sign-in. Please try again later.' });
//     }
//   };

//   return (
//     <div className='signInComp'>
//       <div className="signIn">
//         <h1>Sign In</h1>
//         <form onSubmit={handleSubmit} className='signInForm'>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder='Email'
//             required
//           />
//           {errors.email && <p className='error'>{errors.email}</p>}
          
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder='Password'
//             required
//           />
//           {errors.password && <p className='error'>{errors.password}</p>}
          
//           {errors.general && <p className='error'>{errors.general}</p>}
          
//           <button type="submit" disabled={loading}>
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
          
//           {/* Uncomment the line below if you want a link to register */}
//           {/* <p>No Account? Register <span onClick={onRegisterClick}>Here</span></p> */}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignIn;


// import { useState } from 'react';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../../firebase';
// import './SignIn.css';

// // eslint-disable-next-line react/prop-types
// const SignIn = ({ onSignIn }) => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false); 

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { email, password } = formData;

//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }

//     setLoading(true);
//     // const auth = getAuth();
    
//     try {
//       // Firebase authentication
//       await signInWithEmailAndPassword(auth, email, password);
//       setLoading(false);
//       onSignIn();
//     } catch (error) {
//       setLoading(false);
//       // Handle Firebase authentication errors
//       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
//         setErrors({ general: 'Invalid email or password' });
//       } else {
//         setErrors({ general: 'An error occurred during sign-in. Please try again later.' });
//       }
//     }
//   };

//   const validateForm = () => {
//     let formErrors = {};
//     if (!formData.email) formErrors.email = 'Email is required****';
//     if (!formData.password) formErrors.password = 'Password is required****';
//     return formErrors;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   return (
//     <div className='signInComp'>
//       <div className="signIn">
//         <h1>Sign In</h1>
//         <form onSubmit={handleSubmit} className='signInForm'>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder='Email'
//           />
//           {errors.email && <p className='error'>{errors.email}</p>}
          
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder='Password'
//           />
//           {errors.password && <p className='error'>{errors.password}</p>}
          
//           {errors.general && <p className='error'>{errors.general}</p>}
          
//           <button type="submit" disabled={loading}>
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
          
//           {/* <p>No Account? Register <span onClick={onRegisterClick}>Here</span></p> */}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignIn;



import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Ensure this imports your initialized Firebase app
import './SignIn.css';

const SignIn = ({ onSignIn }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { email, password } = formData;
  
    // Add the validateForm function here
    const validateForm = () => {
      let formErrors = {};
      if (!email) formErrors.email = 'Email is required.';
      if (!password) formErrors.password = 'Password is required.';
      return formErrors;
    };
  
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    setLoading(true);
    setErrors({}); // Clear previous errors
  
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Optional: Send ID token to your backend for verification
      const userExists = await checkUserExists(idToken); // You should define checkUserExists function somewhere in your app
      if (!userExists) {
        setErrors({ general: 'User does not exist.' });
        return;
      }
  
      // Call the function to handle sign-in success
      onSignIn(); // You should define the onSignIn callback in the component that calls handleSubmit
    } catch (error) {
      // Handle Firebase authentication errors
      if (error.code === 'auth/wrong-password') {
        setErrors({ general: 'Invalid email or password' });
      } else if (error.code === 'auth/user-not-found') {
        setErrors({ general: 'No account found with this email.' });
      } else {
        setErrors({ general: 'An error occurred during sign-in. Please try again later.' });
      }
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };
  

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const checkUserExists = async (idToken) => {
    try {
      const response = await fetch('http://localhost:8080/admins', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // Use the ID token here
        },
      });

      if (!response.ok) {
        setErrors({ general: `Error: ${response.statusText}` });
        return false;
      }

      const admins = await response.json();
      
      if (Array.isArray(admins)) {
        return admins.some(admin => admin.email === formData.email);
      } else {
        setErrors({ general: 'Unexpected response format. Please try again later.' });
        return false;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrors({ general: 'Failed to check user existence. Please try again later.' });
      return false;
    }
  };

  // Validation and handleChange functions remain the same

  return (
    <div className='signInComp'>
      <div className="signIn">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit} className='signInForm' noValidate>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder='Email'
            required
            aria-describedby="email-error"
          />
          {errors.email && <p className='error' id="email-error">{errors.email}</p>}
          
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder='Password'
            required
            aria-describedby="password-error"
          />
          {errors.password && <p className='error' id="password-error">{errors.password}</p>}
          
          {errors.general && <p className='error'>{errors.general}</p>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
