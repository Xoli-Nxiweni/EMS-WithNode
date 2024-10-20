import './Landing.css';
import AccountMenu from '../AccountMenu/AccountMenu';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import useAdminRole from '../../Customs/useAdminRole'; // Custom hook for role
import { useEffect, useState } from 'react';
import { IoIosPersonAdd } from "react-icons/io";
import { FaListAlt } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { FaUserSecret } from "react-icons/fa";

// eslint-disable-next-line react/prop-types
const Landing = ({ onLogout, showLogout, onNavClick, activeLink }) => {
  const logo = `https://assets-global.website-files.com/64933e2f73e6774e4cfe37a6/64933e2f73e6774e4cfe37b9_Logos-fake-mock-up-illust-ss143531671-2.png`;
  const [uid, setUid] = useState(null); // State to hold the UID
  const [user, setUser] = useState(null); // Track user state
  const { adminData, loading, error } = useAdminRole(uid); // Fetch admin role data using UID, it will only run when uid is set

  // Monitor authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth State Changed:', currentUser);
      setUser(currentUser); // Set user state when available
      setUid(currentUser ? currentUser.uid : null); // Set the UID if the user is logged in
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Log role state and check for issues
  // useEffect(() => {
  //   if (adminData) {
  //     console.log('Admin Data:', adminData);
  //   }
  //   if (error) {
  //     console.error('Error fetching role:', error);
  //   }
  // }, [adminData, error]);

  // Only render the role check when uid is available
  const role = adminData;
  // console.log('admin data', adminData)
  // console.log('role', role)

  // if (!user) {
  //   return <p>Please log in to continue.</p>; // Handle unauthenticated state
  // }

  return (
    <div className='NavBar'>
      <div className="logo">
        <img src={logo} alt="Company logo" />
      </div>

      <ul className='Links'>
        <li>
          <a
            className={activeLink === 'addEmployee' ? 'active' : ''}
            onClick={() => onNavClick('addEmployee')}
          >
            <h3>Add Employee</h3>
            <IoIosPersonAdd/>
          </a>
        </li>
        <li>
          <a
            className={activeLink === 'viewEmployees' ? 'active' : ''}
            onClick={() => onNavClick('viewEmployees')}
          >
            <h3>Active Employees</h3>
            <FaListAlt/>
          </a>
        </li>
        <li>
          <a
            className={activeLink === 'viewDeletedEmployees' ? 'active' : ''}
            onClick={() => onNavClick('viewDeletedEmployees')}
          >
            <h3>Removed Employees</h3>
            <FaTrashAlt/>
          </a>
        </li>

        {/* Conditionally render Admins section based on user role */}
        {role === 'superAdmin' && ( 
          <li>
            <a
              className={activeLink === 'admins' ? 'active' : ''}
              onClick={() => onNavClick('viewAdmins')}
            >
              <h3>Admins</h3>
              <FaUserSecret/>
            </a>
          </li>
        )}
      </ul>

      <div className="navBtn" style={{ background: 'transparent' }}>
        {showLogout && onLogout && <AccountMenu showLogout={showLogout} />}
      </div>

      {/* Display loading or error states */}
      {loading && <p>Loading admin role...</p>}
      {/* {error && <p>Error fetching role: {error}</p>} */}
    </div>
  );
};

export default Landing;
