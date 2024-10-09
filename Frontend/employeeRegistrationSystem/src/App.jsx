import { useState, useEffect } from 'react';
import './App.css';
import ViewUser from './Components/View Component/ViewEmployee';
import Landing from './Components/Landing Component/Landing';
import SignUp from './Components/AuthComponent/SignUp';
import SignIn from './Components/AuthComponent/SignIn';
import AddUser from './Components/Adding Component/AddEmployee';
import ViewDeletedUsers from './Components/Deleted Users Component/DeletedEmployee';
import Loader from './Components/Loader/Loader';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeComponent, setActiveComponent] = useState('viewEmployees');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if the user is already signed in
    const isSignedIn = localStorage.getItem('isSignedIn');
    setIsLoggedIn(isSignedIn === 'true');
  }, []);

  const handleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      localStorage.setItem('isSignedIn', 'true'); // Persist sign-in status
      setIsLoading(false);
    }, 2000); // Simulate an API call delay
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setActiveComponent('viewEmployees');
      localStorage.setItem('isSignedIn', 'false'); // Clear sign-in status
      setIsLoading(false);
    }, 1000); // Simulate an API call delay
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
            <SignIn onSignIn={handleSignIn} onRegisterClick={handleRegisterClick} />
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
