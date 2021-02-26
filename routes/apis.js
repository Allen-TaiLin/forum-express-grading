const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController.js')

// 全部餐廳資料
router.get('/admin/restaurants', adminController.getRestaurants)
// 查詢一筆資料
router.get('/admin/restaurants/:id', adminController.getRestaurant)

module.exports = router