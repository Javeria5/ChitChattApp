const express = require('express');
const router = express.Router(); 

const {sendMessage, allMessages} = require('../controller/messageController')

const { protect } = require('../middlewares/authMiddleware')

///////////////////All Chat Routes//////////////////////////
router.route('/').post(protect,sendMessage)
router.route('/:chatId').get(protect,allMessages)



module.exports = router;
