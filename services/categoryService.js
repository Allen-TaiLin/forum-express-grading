const db = require('../models')
const { Category } = db

let categoryService = {
  // 查詢全部類別與單一類別(共用)
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then((category) => {
            callback({ categories: categories, category: category.toJSON() })
          })
      } else {
        callback({ categories: categories })
      }
    })
  }
}

module.exports = categoryService