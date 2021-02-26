const db = require('../models')
const ad = require('../models')
const { Restaurant, Category } = db

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ include: [Category], raw: true, nest: true })
      .then((restaurants) => {
        callback({ restaurants })
      })
  }
}

module.exports = adminService