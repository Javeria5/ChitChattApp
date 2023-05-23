const express = require('express');
const router = express.Router();
const { 
    accessChat, 
    fetchChats, 
    CreateGroupChat, 
    renameGroup, 
    addGroupUser,
    removeFromGroup
 } = require('../controller/chatController');
 
const { protect } = require('../middlewares/authMiddleware')


///////////////////All Chat Routes//////////////////////////
router.route('/').post(protect,accessChat)
router.route('/').get(protect,fetchChats)
router.post('/group', (protect, CreateGroupChat));
router.put('/renameGroup', (protect, renameGroup));
router.put('/addGroupUser', (protect, addGroupUser));
router.put('/removeFromGroup', (protect, removeFromGroup));




module.exports = router;
