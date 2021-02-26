const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')

// 全部餐廳資料
router.get('/admin/restaurants', adminController.getRestaurants)
// 查詢一筆資料
router.get('/admin/restaurants/:id', adminController.getRestaurant)
// 瀏覽分類
router.get('/admin/categories', categoryController.getCategories)

module.exports = router