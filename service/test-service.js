/* eslint-disable */
import TestModel from '../models/test-model.js';
// import ApiError from '../exceptions/api-error.js';

class TestService {
  // async getProductLends(product) {
  //   const lends = await LandModel.find({ product });
  //   return lends;
  // }

  // async getTeamsProductsLends(products) {
  //   //TODO тут добавить условие на дополнительное поле разрешающее просмотр
  //   const lends = await LandModel.find(
  //     { product: { $in: products }, status: 'push' },
  //     { product: true, country: true, teamName: true, privacy: true }
  //   );
  //   return lends;
  // }

  async getList() {
    return await TestModel.find({}, { _id: true, name: true });
  }

  // async getRoleName(id) {
  //   const role = await LandModel.findOne({ _id: id }, { _id: true, name: true });
  //   return role;
  // }
}

export default new TestService();
