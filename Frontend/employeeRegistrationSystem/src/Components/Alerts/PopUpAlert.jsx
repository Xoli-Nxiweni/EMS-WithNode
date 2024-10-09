// src/Components/PopupAlert.jsx
import { useEffect } from 'react';
import './PopUpAlert.css';

// eslint-disable-next-line react/prop-types
const PopupAlert = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Popup disappears after 3 seconds

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [onClose]);

  return (
    <div className="popup-alert">
      {message}
    </div>
  );
};

export default PopupAlert;
