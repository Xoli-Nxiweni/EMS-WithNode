import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { firestore } from '../../firebase';
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import UserProfile from '../UserProfile/UserProfile';

// eslint-disable-next-line react/prop-types
export default function AccountMenu({ userId, onLogout }) {
  const [userDetails, setUserDetails] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const auth = getAuth(); // Firebase Auth instance

  const open = Boolean(anchorEl);

  // Fetch user details from Firestore only when the userId changes
  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;

    try {
      const userRef = doc(firestore, 'admins', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserDetails(userSnap.data());
      } else {
        console.error('User not found in admins collection');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const toggleProfile = () => setProfileOpen((prev) => !prev);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      onLogout?.(); // Call onLogout if provided
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open || undefined}
          >
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={userDetails?.photoURL || ''}
            >
              {userDetails?.name?.charAt(0)}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
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
          <Avatar
            src={
              userDetails?.photoURL ||
              'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
            }
          />
          {userDetails?.name || 'Profile'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Dialog open={profileOpen} onClose={toggleProfile} maxWidth="sm" fullWidth>
        <DialogTitle>Your Profile</DialogTitle>
        <DialogContent>
          <UserProfile userId={userId} />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleProfile} color="secondary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
