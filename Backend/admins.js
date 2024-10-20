const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Firebase Admin Initialization
const serviceAccount = require("./employee-management-syst-b975e-firebase-adminsdk-xiafj-35d38c240e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'employee-management-syst-b975e.appspot.com',
});

const db = admin.firestore(); // Firestore reference
const bucket = admin.storage().bucket(); // Storage bucket reference

const router = express.Router();

// Setup multer for handling photo uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to check authentication
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware to check for admin role
const checkAdminRole = (req, res, next) => {
  if (!req.user?.admin) {
    return res.status(403).json({ error: 'Forbidden - Admins only' });
  }
  next();
};

// Function to upload photo to Firebase Storage
const uploadPhoto = async (file) => {
  const photoId = uuidv4();
  const blob = bucket.file(`employee_photos/${photoId}_${file.originalname}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', () => {
      const photoUrl = `https://storage.googleapis.com/${bucket.name}/employee_photos/${photoId}_${file.originalname}`;
      resolve(photoUrl);
    });
    blobStream.on('error', (error) => {
      console.error('Blob stream error:', error);
      reject(new Error('Error uploading photo'));
    });
    blobStream.end(file.buffer);
  });
};

// Admin role management
const setAdminRole = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Admin role set for user with UID: ${uid}`);
  } catch (error) {
    console.error("Error setting admin role:", error);
  }
};

const revokeAdminRole = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: false });
    console.log(`Admin role revoked for user with UID: ${uid}`);
  } catch (error) {
    console.error("Error revoking admin role:", error);
  }
};

// Super Admin Credentials
const SUPER_ADMIN_EMAIL = 'admin@admin.com';
const SUPER_ADMIN_PASSWORD = 'admin123';

// Admin Login with Super Admin Check
router.post('/admins', async (req, res) => {
  const { email, password } = req.body;

  if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const token = await admin.auth().createCustomToken(userRecord.uid);
      return res.status(200).json({ token, isAdmin: true });
    } catch (error) {
      console.error('Error during super admin login:', error);
      return res.status(500).json({ error: 'Error during super admin login' });
    }
  }

  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userData = userSnapshot.docs[0].data();
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = await admin.auth().createCustomToken(userSnapshot.docs[0].id);
    return res.status(200).json({ token, isAdmin: userData.admin });
  } catch (error) {
    console.error('Error during normal user login:', error);
    return res.status(500).json({ error: 'Error during normal user login' });
  }
});

// Promote user to admin (admin-only)
router.post('/admins/promote', authenticate, checkAdminRole, async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await setAdminRole(uid);
    res.status(200).json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ error: 'Error promoting user to admin' });
  }
});

// Demote user from admin (admin-only)
router.post('/admins/demote', authenticate, checkAdminRole, async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await revokeAdminRole(uid);
    res.status(200).json({ message: 'User demoted from admin successfully' });
  } catch (error) {
    console.error('Error demoting user from admin:', error);
    res.status(500).json({ error: 'Error demoting user from admin' });
  }
});

// Add Employee (admin-only)
router.post('/employees', authenticate, checkAdminRole, upload.single('photo'), async (req, res) => {
  const { name, surname, age, idNumber, role } = req.body;

  if (!name || !surname || !age || !idNumber || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const photoUrl = req.file ? await uploadPhoto(req.file) : null;

    const newEmployee = {
      name,
      surname,
      age: Number(age),
      idNumber,
      role,
      photoUrl,
    };

    await db.collection('employees').add(newEmployee);
    res.status(201).json({ message: 'Employee added successfully' });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Error adding employee' });
  }
});

// Fetch all deleted employees
router.get('/deletedEmployees', async (req, res) => {
  try {
    const deletedEmployeesSnapshot = await db.collection('deletedEmployees').get();
    const deletedEmployees = deletedEmployeesSnapshot.docs.map(doc => doc.data());

    res.status(200).json(deletedEmployees);
  } catch (error) {
    console.error('Error fetching deleted employees:', error);
    res.status(500).json({ error: 'Error fetching deleted employees' });
  }
});

// Fetch a specific deleted employee by idNumber
router.get('/deletedEmployees/:idNumber', async (req, res) => {
  try {
    const idNumber = req.params.idNumber;
    const deletedEmployeeDoc = await db.collection('deletedEmployees').doc(idNumber).get();

    if (!deletedEmployeeDoc.exists) {
      return res.status(404).json({ error: 'Deleted employee not found' });
    }

    res.status(200).json(deletedEmployeeDoc.data());
  } catch (error) {
    console.error('Error fetching deleted employee:', error);
    res.status(500).json({ error: 'Error fetching deleted employee' });
  }
});

module.exports = router;

const app = express()
app.listen(3002, () => {
    console.log(`Admins service running on http://localhost:3002`);
  });