import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import UserProfile from '../UserProfile/UserProfile';
import { firestore } from '../../firebase';

// eslint-disable-next-line react/prop-types
export default function AccountMenu({ userId, onLogout }) {
  const [userDetails, setUserDetails] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAdminsClicked, setIsAdminsClicked] = useState(false);
  const open = Boolean(anchorEl);

  const auth = getAuth();

  // Fetch user details from Firestore
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId) {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserDetails(userSnap.data());
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
    setIsAdminsClicked(false); // Close Admins when menu is closed
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        if (onLogout) {
          onLogout(); // Trigger any additional logout actions if provided
        }
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  // Function to toggle profile modal visibility
  const toggleProfile = () => {
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
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
        <MenuItem onClick={toggleProfile}>
          <Avatar src={userDetails?.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'} />
          {userDetails || 'Profile'}
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => { handleLogout(); handleClose(); }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Profile Modal */}
      <Dialog open={profileOpen} onClose={handleProfileClose} maxWidth="sm" fullWidth>
      <DialogTitle>Your Profile</DialogTitle>
      <DialogContent>
        <UserProfile userId={userId} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleProfileClose} color="secondary" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
