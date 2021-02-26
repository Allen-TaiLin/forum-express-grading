const db = require('../models')
const ad = require('../models')
const { Restaurant, Category } = db

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ include: [Category], raw: true, nest: true })
      .then((restaurants) => {
        callback({ restaurants })
      })
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then((restaurant) => {
        callback({ restaurant: restaurant.toJSON() })
      })
  },

  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          })
      })
  }
}

module.exports = adminService