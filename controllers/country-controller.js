import countryService from '../service/country-service.js';
import productService from '../service/product-service.js';
import ApiError from '../exceptions/api-error.js';

class CountryController {
  async create(req, res, next) {
    try {
      const { name } = req.body;
      const isCountry = await countryService.findByName(name);
      if (isCountry) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.COUNTRY.HAS_ALREADY'));
      }
      const data = await countryService.create(req.body);
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      const { name, _id } = req.body;
      let country = await countryService.findById(_id);
      if (!country) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.COUNTRY.NOT_FOUND'));
      }
      const isCountry = await countryService.findByName(name);
      if (isCountry) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.COUNTRY.HAS_ALREADY'));
      }
      if (isCountry && isCountry._id.toString() !== country._id.toString()) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.COUNTRY.HAS_ALREADY'));
      }
      await countryService.update(_id, req.body);
      return res.end();
    } catch (e) {
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      const { _id } = req.body;
      const isCountry = await countryService.findById(_id);
      if (isCountry) {
        throw ApiError.BadRequerest(req.t('CONTROLLER.COUNTRY.NOT_FOUND'));
      }
      await productService.clearCountry(_id);
      await countryService.delete(_id);
      return res.end();
    } catch (e) {
      next(e);
    }
  }

  async get(req, res, next) {
    try {
      const { _id } = req.body;
      const data = await countryService.get(_id);
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async getList(req, res, next) {
    try {
      const data = await countryService.getList();
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }
}

export default new CountryController();
