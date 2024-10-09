import React, { useState } from 'react';

const UserProfile = ({ showLogout }) => {
    const [userProfileToggled, setUserProfileToggled] = useState(false);
    const [editedUser, setEditedUser] = useState(); // For handling updates

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = () => {
        // Logic to update user profile
        onUpdate(editedUser);
        setUserProfileToggled(false); // Close popup after update
    };

    return (
        <div className='PopupWrapper'>
            <div className="UserPopUp">
            {showLogout ? (
                <h1 onClick={() => setUserProfileToggled(true)}>User Icon Here</h1>
            ) : (
                <p>No access to user profile</p>
            )}

            {userProfileToggled && (
                <div className="userProfile">
                    <h2>User Profile</h2>
                    <img src={''} alt="User" />
                    <p>Name: {'Xoli'}</p>
                    <p>Surname: {'Nxiweni'}</p>
                    <p>Age: {20}</p>
                    <p>ID Number: {1585648681}</p>
                    <p>Role: {'Manager'}</p>

                    <h3>Edit Profile</h3>
                    <input
                        type="text"
                        name="name"
                        // value={editedUser.name}
                        onChange={handleInputChange}
                        placeholder="Name"
                    />
                    <input
                        type="text"
                        name="surname"
                        // value={editedUser.surname}
                        onChange={handleInputChange}
                        placeholder="Surname"
                    />
                    <input
                        type="number"
                        name="age"
                        // value={editedUser.age}
                        onChange={handleInputChange}
                        placeholder="Age"
                    />
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => onDelete()}>Delete User</button>
                    <button onClick={() => setUserProfileToggled(false)}>Close</button>
                </div>
            )}
            </div>
        </div>
    );
};

export default UserProfile;
