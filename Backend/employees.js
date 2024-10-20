// employees.js
const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Firebase Admin Initialization
const serviceAccount = require("./employee-management-syst-b975e-firebase-adminsdk-xiafj-35d38c240e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'employee-management-syst-b975e.appspot.com',
});

const db = admin.firestore(); // Firestore reference
const bucket = admin.storage().bucket(); // Storage bucket reference

const router = express.Router();

// Firebase Admin Initialization (Assuming it's initialized globally elsewhere)

const upload = multer({ storage: multer.memoryStorage() });

// // Firebase Admin Initialization


// Middleware to check authentication
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; 
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware to check admin role
const checkAdminRole = (req, res, next) => {
  if (!req.user?.admin) {
    return res.status(403).json({ error: 'Forbidden - Admins only' });
  }
  next();
};

// Upload photo helper function
const uploadPhoto = async (file) => {
  const photoId = uuidv4();
  const blob = bucket.file(`employee_photos/${photoId}_${file.originalname}`);
  const blobStream = blob.createWriteStream({
    metadata: { contentType: file.mimetype },
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

// Get All Employees (no auth required)
router.get('/employees', async (req, res) => {
  try {
    const employeeSnapshot = await db.collection('employees').get();
    const employees = employeeSnapshot.docs.map(doc => doc.data());
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Error fetching employees' });
  }
});

// Get Employee by idNumber
router.get('/employees/:idNumber', async (req, res) => {
    const idNumber = req.params.idNumber;
    try {
      const employeeSnapshot = await db.collection('employees').where('idNumber', '==', idNumber).get();
      if (employeeSnapshot.empty) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      const employee = employeeSnapshot.docs[0].data();
      res.status(200).json(employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ error: 'Error fetching employee' });
    }
  });
  

// Update Employee by idNumber (admin-only)
router.put('/employees:idNumber', authenticate, checkAdminRole, upload.single('photo'), async (req, res) => {
  const idNumber = req.params.idNumber;
  const { name, surname, age, role } = req.body;

  try {
    const employeeSnapshot = await db.collection('employees').where('idNumber', '==', idNumber).get();
    if (employeeSnapshot.empty) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employeeDoc = employeeSnapshot.docs[0].ref;
    const updatedData = {
      name,
      surname,
      age: Number(age),
      role,
      ...(req.file && { photoUrl: await uploadPhoto(req.file) }),
    };

    await employeeDoc.update(updatedData);
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Error updating employee' });
  }
});

// Delete Employee by idNumber (admin-only)
router.delete('/employees:idNumber', authenticate, checkAdminRole, async (req, res) => {
  const idNumber = req.params.idNumber;

  try {
    const employeeSnapshot = await db.collection('employees').where('idNumber', '==', idNumber).get();
    if (employeeSnapshot.empty) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employeeData = employeeSnapshot.docs[0].data();
    await db.collection('deletedEmployees').add(employeeData); // Move to deletedEmployees
    await employeeSnapshot.docs[0].ref.delete(); // Delete from employees collection

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Error deleting employee' });
  }
});

module.exports = router;
 
const app = express()
app.listen(3001, () => {
    console.log(`Employees service running on http://localhost:3001`);
  });