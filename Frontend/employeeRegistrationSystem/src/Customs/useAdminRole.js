import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure correct Firebase config import

const useAdminRole = (uid) => {
  const [adminData, setAdminData] = useState(null); // Store entire admin data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (!uid) {
          throw new Error('User ID is required'); // Check if UID is provided
        }

        console.log(`Fetching admin data for UID: ${uid}`);
        
        // Query for the admin document using the uid field
        const q = query(collection(db, 'admins'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        console.log('snapshot', querySnapshot)

        // Check if any documents were found
        if (!querySnapshot.empty) {
          const adminDoc = querySnapshot.docs[0]; // Get the first matching document
          const data = adminDoc.data(); // Get the data from the document
          console.log('admin doc', adminDoc)
          console.log('Admin data:', data.role); // Log the fetched admin data
          setAdminData(data.role); // Store the entire admin data
        } else {
          console.error('No document found for UID:', uid);
          throw new Error('Admin document not found');
        }
      } catch (err) {
        console.error('Error fetching admin data:', err); // Log any errors
        setError(err.message); // Set the error message
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchRole(); // Call the fetch function
  }, [uid]); // Dependency on uid

  return { adminData, loading, error }; // Return admin data, loading state, and error
};

export default useAdminRole;
