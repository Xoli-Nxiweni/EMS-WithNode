const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// Firebase Admin Initialization
const serviceAccount = require('./employee-management-syst-b975e-firebase-adminsdk-xiafj-35d38c240e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'employee-management-syst-b975e.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Express App Setup
const app = express();
// Update CORS middleware to allow credentials
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials
}));

app.use(bodyParser.json());

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
const checkAdminRole = async (req, res, next) => {
  try {
    const adminSnapshot = await db.collection('admins').doc(req.user.uid).get();
    if (!adminSnapshot.exists || !adminSnapshot.data().admin) {
      return res.status(403).json({ error: 'Forbidden - Admins only' });
    }
    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ error: 'Error checking admin role' });
  }
};

// Middleware to verify ID tokens
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user information to the request
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).send('Unauthorized');
  }
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

// Super Admin Credentials
const SUPER_ADMIN_EMAIL = 'admin@admin.com';
const SUPER_ADMIN_PASSWORD = 'admin123';

// Check if super admin exists in Firestore, if not create it
const ensureSuperAdminExists = async () => {
  const adminSnapshot = await db.collection('admins').where('email', '==', SUPER_ADMIN_EMAIL).get();
  if (adminSnapshot.empty) {
    console.log('Super admin not found, creating super admin...');
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    await db.collection('admins').add({
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      admin: true,
    });
    console.log('Super admin created successfully');
  } 
};

// Admin Login with Super Admin Check
app.get('/admin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminSnapshot = await db.collection('admins').where('email', '==', email).get();
    if (adminSnapshot.empty) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    const adminData = adminSnapshot.docs[0].data();
    const passwordMatch = await bcrypt.compare(password, adminData.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const userRecord = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(userRecord.uid);
    return res.status(200).json({ token, isAdmin: adminData.admin });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ error: 'Error during admin login' });
  }
});

app.get('/admins', authenticate, verifyToken, async (req, res) => {
  try {
    const employeesSnapshot = await db.collection('admins').get();
    const employees = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error retrieving employees:', error);
    res.status(500).json({ error: 'Error retrieving employees' });
  }
});
app.get('/admin:id', async (req, res) =>{

})

// Routes

// 1. Create a new admin (sign-up)
app.post('/admins', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRecord = await admin.auth().createUser({
      email,
      password: hashedPassword,
    });

    await db.collection('admins').doc(userRecord.uid).set({
      email,
      password: hashedPassword,
      admin: false,
    });

    res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});



// 2. Promote user to admin (admin-only)
app.post('/admin/promote', authenticate, checkAdminRole, async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await db.collection('admins').doc(uid).set({ admin: true }, { merge: true });
    res.status(200).json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ error: 'Error promoting user to admin' });
  }
});

// 3. Demote user from admin (admin-only)
app.post('/admin/demote', authenticate, checkAdminRole, async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await db.collection('admins').doc(uid).set({ admin: false }, { merge: true });
    res.status(200).json({ message: 'User demoted from admin successfully' });
  } catch (error) {
    console.error('Error demoting user from admin:', error);
    res.status(500).json({ error: 'Error demoting user from admin' });
  }
});

// 4. Add Employee (admin-only)
app.post('/employees', authenticate, checkAdminRole, upload.single('photo'), async (req, res) => {
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

// Fetch all employees
app.get('/employees', authenticate, async (req, res) => {
  try {
    const employeesSnapshot = await db.collection('employees').get();
    const employees = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error retrieving employees:', error);
    res.status(500).json({ error: 'Error retrieving employees' });
  }
});

// Fetch a specific employee by idNumber
app.get('/employees/:idNumber', authenticate, async (req, res) => {
  try {
    const idNumber = req.params.idNumber;
    const employeesSnapshot = await db.collection('employees').where('idNumber', '==', idNumber).get();

    if (employeesSnapshot.empty) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))[0];

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error retrieving employee:', error);
    res.status(500).json({ error: 'Error retrieving employee' });
  }
});

// Delete an employee by ID (admin-only)
app.delete('/employees/:id', authenticate, checkAdminRole, async (req, res) => {
  try {
    const employeeId = req.params.id;
    await db.collection('employees').doc(employeeId).delete();
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Error deleting employee' });
  }
});

// Update an employee by ID (admin-only)
app.put('/employees/:id', authenticate, checkAdminRole, upload.single('photo'), async (req, res) => {
  const { name, surname, age, idNumber, role } = req.body;
  const employeeId = req.params.id;

  if (!name || !surname || !age || !idNumber || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const photoUrl = req.file ? await uploadPhoto(req.file) : null;

    const updatedEmployee = {
      name,
      surname,
      age: Number(age),
      idNumber,
      role,
      ...(photoUrl && { photoUrl }),
    };

    await db.collection('employees').doc(employeeId).update(updatedEmployee);
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Error updating employee' });
  }
});

app.get('/deletedEmployees', authenticate, async (req, res) => {
  try {
    const employeesSnapshot = await db.collection('deletedEmployees').get();
    const employees = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error retrieving employees:', error);
    res.status(500).json({ error: 'Error retrieving employees' });
  }
});

// Start server and ensure super admin is created
app.listen(8080, async () => {
  await ensureSuperAdminExists();
  console.log('Server is running on port 8080');
});
