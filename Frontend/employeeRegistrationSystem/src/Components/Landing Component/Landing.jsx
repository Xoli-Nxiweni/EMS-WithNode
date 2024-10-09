import './Landing.css';
import UserProfile from '../UserProfile/UserProfile';
import AccountMenu from '../AccountMenu/AccountMenu';

// eslint-disable-next-line react/prop-types
const Landing = ({ onLogout, showLogout, onNavClick, activeLink, role }) => {
  const logo = `https://assets-global.website-files.com/64933e2f73e6774e4cfe37a6/64933e2f73e6774e4cfe37b9_Logos-fake-mock-up-illust-ss143531671-2.png`;

  return (
    <div className='NavBar'>
      <div className="logo">
        <img src={logo} alt="" />
      </div>
      <ul className='Links'>
        <li>
          <a
            className={activeLink === 'addEmployee' ? 'active' : ''}
            onClick={() => onNavClick('addEmployee')}
          >
            Add Employee
          </a>
        </li>
        <li>
          <a
            className={activeLink === 'viewEmployees' ? 'active' : ''}
            onClick={() => onNavClick('viewEmployees')}
          >
            Active Employees
          </a>
        </li>
        <li>
          <a
            className={activeLink === 'viewDeletedEmployees' ? 'active' : ''}
            onClick={() => onNavClick('viewDeletedEmployees')}
          >
            Removed Employees
          </a>
        </li>
        {/* Conditionally render Admins section if the user is a superuser */}
        {role === 'superuser' && (
          <li>
            <a
              className={activeLink === 'admins' ? 'active' : ''}
              onClick={() => onNavClick('admins')}
            >
              Admins
            </a>
          </li>
        )}
      </ul>
      <div className="navBtn">
        {showLogout && onLogout && <AccountMenu showLogout={showLogout} />}
      </div>
    </div>
  );
};

export default Landing;
