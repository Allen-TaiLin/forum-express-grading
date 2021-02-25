const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const helpers = require('../_helpers')

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

const multer = require('multer')
const { authenticate } = require('passport')
const upload = multer({ dest: 'temp/' })

// 記得這邊要接收app、passport

const authenticated = (req, res, next) => {
  // if (req.isAuthenticated()) {
  //   return next()
  // }
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated()) {
  //   if (req.user.isAdmin) { return next() }
  //   return res.redirect('/')
  // }    
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

// 如果使用者訪問首頁，就導向 /restaurants 的頁面
router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
// 在 /restaurants 底下則交給 restController 來處理
router.get('/restaurants', authenticated, restController.getRestaurants)
// Top 10 人氣餐廳
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
// 最新動態
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
// 餐廳資料
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
// 餐廳資料整理
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

router.post('/comments', authenticated, commentController.postComment)

router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
// 加入最愛
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
// 移除最愛
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
// 設定like
router.post('/like/:restaurantId', authenticated, userController.addLike)
// 解除like
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
// 美食達人頁面
router.get('/users/top', authenticated, userController.getTopUser)
// 追蹤使用者
router.post('/following/:userId', authenticated, userController.addFollowing)
// 取消追蹤
router.delete('/following/:userId', authenticated, userController.removeFollowing)

// 連到 /admin 頁面就轉到 /admin/restaurants
router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
// 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
// 新增頁面
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
// 新增表單
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
// 查詢一筆資料
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
// 修改頁面
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
// 修改表單
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
// 刪除一筆資料
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
// 顯示使用者列表
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
// 修改使用者權限
router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
// 瀏覽分類
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)

router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)

router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

// A19 User Profile
// 查詢頁面
router.get('/users/:id', authenticated, userController.getUser)
// 修改頁面
router.get('/users/:id/edit', authenticated, userController.editUser)
// 送出修改
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)


// 註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
// 登入、登出
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

module.exports = router