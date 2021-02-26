const db = require('../models')
const { Category } = db
const categoryService = require('../services/categoryService.js')

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })

    // return Category.findAll({
    //   raw: true,
    //   nest: true
    // }).then(categories => {
    //   if (req.params.id) {
    //     Category.findByPk(req.params.id)
    //       .then((category) => {
    //         return res.render('admin/categories', {
    //           categories: categories,
    //           category: category.toJSON()
    //         })
    //       })
    //   } else {
    //     return res.render('admin/categories', { categories: categories })
    //   }
    // })
  },

  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      })
        .then((category) => {
          return res.redirect('/admin/categories')
        })
    }
  },

  putCategory: (req, res) => {
    categoryService.putCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
    })
  },

  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
          .then((category) => {
            res.redirect('/admin/categories')
          })
      })
  }
}

module.exports = categoryController