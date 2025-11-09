const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth, requireRole } = require('../utils/auth');

// Récupérer tous les utilisateurs
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ username: 1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un utilisateur
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ user: userResponse, message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Si le mot de passe est fourni, le laisser au pre-save hook pour le hasher
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    Object.assign(user, updateData);
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ user: userResponse, message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
