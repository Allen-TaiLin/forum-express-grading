const bcrypt = require('bcryptjs')
//const app = require('../app')
const db = require('../models')
const { User, Comment, Restaurant, Category, Favorite, Like, Followship } = db
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const sequelize = db.sequelize
const helpers = require('../_helpers')

const userController = {
  // 註冊頁面
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  // 註冊送出表單
  signUp: (req, res) => {
    // TODO：confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // TODO：confirm unique user
      User.findOne({ where: { email: req.body.email } })
        .then((user) => {
          if (user) {
            req.flash('error_messages', '信箱重複！')
            return res.redirect('/signup')
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            }).then((user) => {
              req.flash('success_messages', '成功註冊帳號！')
              return res.redirect('/signin')
            })
          }
        })
    }
  },

  // 登入頁面
  signInPage: (req, res) => {
    return res.render('signin')
  },

  // 登入送出表單
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/restaurants')
  },

  // 登出
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    return res.redirect('/signin')
  },

  // 瀏覽 Profile
  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(DISTINCT RestaurantId) FROM comments)'), 'restaurant_count'],
          [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM comments)'), 'comment_count']
        ]
      },
      group: ['comments.RestaurantId'],
      nest: true,
      include: {
        model: Comment,
        attributes: ['RestaurantId'],
        nest: true,
        include: [{
          model: Restaurant
        }]
      }
    })
      .then((user) => {
        // TODO：列出 user.toJSON()物件內資訊
        //console.log('*user.toJSON():', user.toJSON())
        //console.log('**user.toJSON().Comments[0].Restaurant:', user.toJSON().Comments[0].Restaurant)

        let restaurants = (user.toJSON().Comments.length > 0) ?
          user.toJSON().Comments.map((item) => item.Restaurant) : null
        return res.render('user', { user: user.toJSON(), restaurants })
      })
  },

  // 瀏覽編輯 Profile 頁面
  editUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        return res.render('edit', { user: user.toJSON() })
      })
  },

  // 編輯 Profile
  putUser: async (req, res, next) => {
    try {
      const { file } = req
      let img = null
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        const uploadImage = new Promise((resolve, reject) => {
          imgur.upload(file.path, (error, image) => {
            img = image
            resolve()
          })
        })
        await uploadImage.then(() => console.log('uploaded'))
      }

      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            ...req.body,
            image: (file && img) ? img.data.link : req.body.image
          }).then(() => {
            req.flash('success_messages', '個人資料已更新!')
            res.redirect(`/users/${req.params.id}`)
          })
        })

    } catch (error) {
      next(error)
    }
  },

  // 加入最愛
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((favorite) => {
        return res.redirect('back')
      })
  },

  // 移除最愛
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((result) => {
            return res.redirect('back')
          })
      })
  },

  // 加入Like
  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then((like) => {
        return res.redirect('back')
      })
  },

  // 移除UnLike
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((like) => {
        like.destroy()
          .then((result) => {
            return res.redirect('back')
          })
      })
  },

  // 美食達人頁面
  getTopUser: (req, res) => {
    // TODO：撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    })
      .then((users) => {
        // TODO：整理 users 資料
        users = users.map((user) => ({
          ...user.dataValues,
          // TODO：計算追蹤者人數
          FollowerCount: user.Followers.length,
          // TODO：判斷目前登入使用者是否已追蹤該 User 物件
          isFollowed: req.user.Followings.map((d) => d.id).includes(user.id)
        }))
        // TODO：依追蹤者人數排序清單
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUser', { users: users })
      })
  },

  // 追蹤使用者
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  // 取消追蹤
  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((result) => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = userController