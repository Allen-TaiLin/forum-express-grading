const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')

// 引入 multer 並設定上傳資料夾 
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

// 全部餐廳資料
router.get('/admin/restaurants', adminController.getRestaurants)
// 查詢一筆資料
router.get('/admin/restaurants/:id', adminController.getRestaurant)
// 修改表單(個別餐廳)
router.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)
// 瀏覽餐聽分類
router.get('/admin/categories', categoryController.getCategories)
// 新增餐聽分類
router.post('/admin/categories', categoryController.postCategory)
// 修改餐聽分類
router.put('/admin/categories/:id', categoryController.putCategory)
// 新增餐廳
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
// 刪除餐廳
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

module.exports = router