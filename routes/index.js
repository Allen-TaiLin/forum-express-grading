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
module.exports = (app, passport) => {
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
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  // 在 /restaurants 底下則交給 restController 來處理
  app.get('/restaurants', authenticated, restController.getRestaurants)
  // Top 10 人氣餐廳
  app.get('/restaurants/top', authenticated, restController.getTopRestaurants)
  // 最新動態
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
  // 餐廳資料
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  // 餐廳資料整理
  app.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

  app.post('/comments', authenticated, commentController.postComment)

  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
  // 加入最愛
  app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
  // 移除最愛
  app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
  // 設定like
  app.post('/like/:restaurantId', authenticated, userController.addLike)
  // 解除like
  app.delete('/like/:restaurantId', authenticated, userController.removeLike)
  // 美食達人頁面
  app.get('/users/top', authenticated, userController.getTopUser)
  // 追蹤使用者
  app.post('/following/:userId', authenticated, userController.addFollowing)
  // 取消追蹤
  app.delete('/following/:userId', authenticated, userController.removeFollowing)

  // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  // 新增頁面
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  // 新增表單
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  // 查詢一筆資料
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  // 修改頁面
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  // 修改表單
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  // 刪除一筆資料
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
  // 顯示使用者列表
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  // 修改使用者權限
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
  // 瀏覽分類
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)

  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)

  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  // A19 User Profile
  // 查詢頁面
  app.get('/users/:id', authenticated, userController.getUser)
  // 修改頁面
  app.get('/users/:id/edit', authenticated, userController.editUser)
  // 送出修改
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)


  // 註冊
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  // 登入、登出
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}
