import categoryService from '../service/category-service.js';
import ApiError from '../exceptions/api-error.js';

class CategoryController {
  async create(req, res, next) {
    try {
      const { name } = req.body;
      const isCategory = await categoryService.findByName(name);
      if (isCategory) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.CATEGORY.HAS_ALREADY'));
      }
      const data = await categoryService.create({ name });
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      const { name, _id } = req.body;
      let category = await categoryService.findById(_id);
      if (!category) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.CATEGORY.NOT_FOUND'));
      }
      const isCategory = await categoryService.findByName(name);
      if (isCategory) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.CATEGORY.HAS_ALREADY'));
      }
      if (isCategory && isCategory._id.toString() !== category._id.toString()) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.CATEGORY.HAS_ALREADY'));
      }
      await categoryService.update(_id, { name });
      return res.end();
    } catch (e) {
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      const { _id } = req.body;
      const isCategory = await categoryService.findById(_id);
      if (isCategory) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.CATEGORY.NOT_FOUND'));
      }
      await categoryService.delete(_id);
      return res.end();
    } catch (e) {
      next(e);
    }
  }

  async getList(req, res, next) {
    try {
      const data = await categoryService.getList();
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }
}

export default new CategoryController();
