const db = require('../../models')
const adminService = require('../../services/adminService')
const { Category } = db
const categoryService = require('../../services/categoryService.js')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.json(data)
    })
  },

  putCategory: (req, res) => {
    categoryService.putCategory(req, res, (data) => {
      return res.json(data)
    })
  },
}

module.exports = categoryController