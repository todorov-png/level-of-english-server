/* eslint-disable */
import LandModel from '../models/land-model.js';
// import ApiError from '../exceptions/api-error.js';

class LandService {
  async getProductLends(product) {
    const lends = await LandModel.find({ product });
    return lends;
  }

  async getTeamsProductsLends(products) {
    //TODO тут добавить условие на дополнительное поле разрешающее просмотр
    const lends = await LandModel.find(
      { product: { $in: products }, status: 'push' },
      { product: true, country: true, teamName: true, privacy: true }
    );
    return lends;
  }

  // async getRolesList() {
  //   const roles = await LandModel.find({}, { _id: true, name: true });
  //   return roles;
  // }

  // async getRoleName(id) {
  //   const role = await LandModel.findOne({ _id: id }, { _id: true, name: true });
  //   return role;
  // }
}

export default new LandService();
