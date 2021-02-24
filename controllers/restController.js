const db = require('../models')
const { Restaurant, Category, User, Comment } = db
const pageLimit = 10
const helpers = require('../_helpers')
const sequelize = require('sequelize')

const restController = {
  // 多筆餐廳資料
  getRestaurants: (req, res) => {
    let offset = 0  // 分頁起始
    const whereQuery = {}
    let categoryId = ''
    // 分頁設定 (有參數時才開始運算)
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    // 類別搜尋
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    })
      .then((result) => {
        // data for pagination
        const page = Number(req.query.page) || 1  //  起始頁數
        const pages = Math.ceil(result.count / pageLimit) //  總頁數
        const totalPage = Array.from({ length: pages }).map((item, index) => index + 1) //  總共有幾頁 (顯示列表上)
        // TODO：列出觀察物件資料內容
        // console.log('***', totalPage)
        // console.log('result.count:', result.count)
        // console.log('result.rows:', result.rows)
        const prev = (page - 1 < 1) ? 1 : page - 1
        const next = (page + 1 > pages) ? pages : page + 1

        // clean up restaurant data
        const data = result.rows.map((r) => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          categoryName: r.dataValues.Category.name,
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
        }))

        Category.findAll({
          raw: true,
          nest: true
        })
          .then((categories) => {
            return res.render('restaurants', {
              restaurants: data,
              categories: categories,
              categoryId: categoryId,
              page: page,
              totalPage: totalPage,
              prev: prev,
              next: next
            })
          })
      })
  },

  // 單筆餐廳資料
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },  // 加入關聯資料
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    })
      .then(async (restaurant) => {
        // 找出收藏此餐廳的 user
        const userId = helpers.getUser(req).id
        const isFavorited = restaurant.FavoritedUsers.map((d) => d.id).includes(userId)
        const isLiked = restaurant.LikedUsers.map((d) => d.id).includes(userId)

        // 瀏覽次數
        if (restaurant) {
          // TODO：也可以寫 await restaurant.increment('viewCounts', { by: 1 })
          restaurant = await restaurant.increment({ 'viewCounts': 1 })
        }

        return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited: isFavorited, isLiked: isLiked })
      })
  },

  // 最新動態
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', { restaurants, comments })
    })
  },

  // 餐廳資訊整理
  getDashboard: (req, res) => {
    const id = req.params.id
    return Promise.all([
      Comment.count({ where: { RestaurantId: id } }),
      Restaurant.findByPk(id, {
        nest: true,
        include: [Category]
        // attributes: { include: ['viewCounts'] }
      })
    ]).then(([commentCount, restaurant]) => {
      res.render('dashboard', { commentCount, restaurant: restaurant.toJSON() })
    })
  },

  // Top 10 人氣餐廳
  getTopRestaurants: (req, res) => {
    // 登入者收藏的餐廳資料
    const favoritedRestaurants = helpers.getUser(req).FavoritedRestaurants
    return Restaurant.findAll({
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM Favorites WHERE Favorites.RestaurantId = Restaurant.id)'), 'FavoritedCount'],
          [sequelize.literal(`(SELECT Likes.UserId FROM Likes WHERE Likes.RestaurantId = Restaurant.id And Likes.UserId = ${req.user.id})`), 'LikeByUsers']
        ]
      },
      order: [
        [sequelize.literal('FavoritedCount'), 'DESC']
      ],
      raw: true,
      nest: true,
      limit: 10
    })
      .then((restaurants) => {
        console.log('*restaurants:', restaurants)
        //console.log('*restaurants.json:', restaurants.toJSON())
        restaurants = restaurants.map((restaurant) => ({
          ...restaurant,
          description: restaurant.description.substring(0, 50),
          isFavorited: favoritedRestaurants.map((item) => item.id).includes(restaurant.id),
          isLike: (restaurant.LikeByUsers !== null)
        }))

        return res.render('topRestaurants', { restaurants })
      })
  }
}

module.exports = restController