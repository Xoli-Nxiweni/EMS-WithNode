import { useState, useEffect } from 'react';
import './App.css';
import ViewUser from './Components/View Component/ViewEmployee';
import Landing from './Components/Landing Component/Landing';
import SignUp from './Components/AuthComponent/SignUp';
import SignIn from './Components/AuthComponent/SignIn';
import AddUser from './Components/Adding Component/AddEmployee';
import ViewDeletedUsers from './Components/Deleted Users Component/DeletedEmployee';
import Loader from './Components/Loader/Loader';
import Admins from './Components/AdminsComponent/Admins';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase'; // import Firebase auth

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeComponent, setActiveComponent] = useState('viewEmployees');
  const [isLoading, setIsLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Set isLoggedIn based on user presence
      setIsLoading(false); // Stop loading once the auth state is determined
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
    } catch (error) {
      console.error('Login error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
    signOut(auth); // Sign out using Firebase auth
      setActiveComponent('viewEmployees'); // Reset to default component
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavClick = (component) => {
    setActiveComponent(component);
  };

  const handleRegisterClick = () => {
    setShowSignUp(true);
  };

  const handleSignInClick = () => {
    setShowSignUp(false);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'addEmployee':
        return <AddUser onBack={() => setActiveComponent('viewEmployees')} />;
      case 'viewEmployees':
        return <ViewUser onAddUserClick={() => setActiveComponent('addEmployee')} />;
      case 'viewDeletedEmployees':
        return <ViewDeletedUsers />;
      case 'viewAdmins':
        return <Admins onViewAdmins={() => setActiveComponent('viewAdmins')} />;
      default:
        return <ViewUser onAddUserClick={() => setActiveComponent('addEmployee')} />;
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <nav>
        <Landing 
          onLogout={handleLogout} 
          showLogout={isLoggedIn && !showSignUp} 
          onNavClick={handleNavClick} 
          activeLink={activeComponent}
        />
      </nav>
      <main>
        {!isLoggedIn ? (
          showSignUp ? (
            <SignUp onSignInClick={handleSignInClick} />
          ) : (
            <SignIn onSignIn={handleLogin} onRegisterClick={handleRegisterClick} />
          )
        ) : (
          <div>
            {renderComponent()}
          </div>
        )}
      </main>
    </>
  );
};

export default App;
