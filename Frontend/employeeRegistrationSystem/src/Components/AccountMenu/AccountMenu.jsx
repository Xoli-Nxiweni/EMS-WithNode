import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Firestore operations
import { db, auth } from '../../firebase'; // Firebase initialization
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

// eslint-disable-next-line react/prop-types
const AccountMenu = ({ userId, userRole }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfile, setShowProfile] = useState(false); // Toggle for UserProfile
  const [editedUser, setEditedUser] = useState({}); // For handling updates
  const open = Boolean(anchorEl);

  // Fetch user details from Firestore
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserDetails(userSnap.data());
          setEditedUser(userSnap.data());
        }
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, editedUser);
      setUserDetails(editedUser);
      alert('Profile updated successfully!');
      setShowProfile(false); // Close the popup after update
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      alert('User deleted successfully!');
      setShowProfile(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }} src={userDetails?.photoURL || ''}>
              {userDetails?.name?.charAt(0)}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      {/* MUI Account Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => setShowProfile(true)}>
          <Avatar src={userDetails?.photoURL || ''} /> {userDetails?.name || 'Profile'}
        </MenuItem>
        <MenuItem onClick={() => setShowProfile(true)}>
          <Avatar /> My account
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          Add another account
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => { handleLogout(); handleClose(); }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* UserProfile Popup */}
      {showProfile && (
        <div className='PopupWrapper'>
          <div className="UserPopUp">
            <div className="userProfile">
              <h2>User Profile</h2>
              <img src={userDetails?.photoURL || ''} alt="User" />
              <p>Name: {userDetails?.name || 'N/A'}</p>
              <p>Surname: {userDetails?.surname || 'N/A'}</p>
              <p>Age: {userDetails?.age || 'N/A'}</p>
              <p>ID Number: {userDetails?.idNumber || 'N/A'}</p>
              <p>Role: {userRole || 'N/A'}</p>

              <h3>Edit Profile</h3>
              <input
                type="text"
                name="name"
                value={editedUser.name || ''}
                onChange={handleInputChange}
                placeholder="Name"
              />
              <input
                type="text"
                name="surname"
                value={editedUser.surname || ''}
                onChange={handleInputChange}
                placeholder="Surname"
              />
              <input
                type="number"
                name="age"
                value={editedUser.age || ''}
                onChange={handleInputChange}
                placeholder="Age"
              />
              <button onClick={handleUpdate}>Update</button>
              <button onClick={handleDelete}>Delete User</button>
              <button onClick={() => setShowProfile(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountMenu;
