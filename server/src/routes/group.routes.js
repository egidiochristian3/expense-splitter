const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  deleteGroup
} = require('../controllers/group.controller');

router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupById);
router.post('/:id/members', protect, addMember);
router.delete('/:id', protect, deleteGroup);

module.exports = router;