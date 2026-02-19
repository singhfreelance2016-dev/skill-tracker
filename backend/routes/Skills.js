const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

// GET all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single skill
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new skill
router.post('/', async (req, res) => {
  try {
    const { name, proficiency, category } = req.body;
    
    // Validation
    if (!name || !proficiency || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const skill = new Skill({
      name,
      proficiency,
      category
    });

    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update skill
router.put('/:id', async (req, res) => {
  try {
    const { name, proficiency, category } = req.body;
    
    // Validation
    if (!name || !proficiency || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    skill.name = name;
    skill.proficiency = proficiency;
    skill.category = category;
    skill.updatedAt = Date.now();

    const updatedSkill = await skill.save();
    res.json(updatedSkill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE skill
router.delete('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    await skill.deleteOne();
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;