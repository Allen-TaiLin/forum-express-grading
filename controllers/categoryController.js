const db = require('../models')
const { Category } = db

let categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then((categories) => {
        return categories
      })
  }
}

module.exports = categoryController