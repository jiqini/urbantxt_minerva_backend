const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  const { username, emailOrPhone, password } = req.body;

  try {
    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, emailOrPhone, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Usuario creado exitosamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username }, { emailOrPhone: username }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'minerva-secret-key',
      { expiresIn: '7d' }
    )

    // ✅ RETURN USER DATA AND TOKEN
    res.status(200).json({ 
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user._id.toString(),
        username: user.username,
        emailOrPhone: user.emailOrPhone
      },
      token: token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error del servidor.' });
  }
});


module.exports = router;
// defines an Express.js route for user signup. It checks if a user already exists with the provided email or phone, hashes the password, and saves the new user to the database. If successful, it returns a success message; otherwise, it handles errors appropriately.
// User model is imported from the models directory, and bcrypt is used for password hashing.