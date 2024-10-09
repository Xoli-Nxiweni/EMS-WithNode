import PropTypes from 'prop-types';
import './DeletedModal.css';

const DeletedModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>User Details</h2>
        <img src={user.photoUrl || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"} alt="User" />
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Surname:</strong> {user.surname}</p>
        <p><strong>Age:</strong> {user.age}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>ID:</strong> {user.idNumber}</p>
      </div>
    </div>
  );
};

DeletedModal.propTypes = {
  user: PropTypes.shape({
    photoUrl: PropTypes.string,
    name: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired,
    age: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    idNumber: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default DeletedModal;
