/* eslint-disable */
import RoleModel from '../models/role-model.js';
import ApiError from '../exceptions/api-error.js';
import userService from '../service/user-service.js';

class RoleService {
  async createRole(data, i18n) {
    if (!Object.keys(data.permissions).length) {
      throw ApiError.BadRequerest(i18n.t('ROLE_SERVICE.NOT_PERMISSIONS'));
    }
    data.name = data.name.toLowerCase();
    const isRole = await RoleModel.findOne({ name: data.name });
    if (isRole) {
      throw ApiError.BadRequerest(i18n.t('ROLE_SERVICE.HAS_ALREADY'));
    }
    const role = await RoleModel.create(data);
    return role;
  }

  async updateRole(data, i18n) {
    if (!Object.keys(data.permissions).length) {
      throw ApiError.BadRequerest(i18n.t('ROLE_SERVICE.NOT_PERMISSIONS'));
    }
    const role = await RoleModel.findById(data._id);
    if (!role) {
      throw ApiError.BadRequerest(i18n.t('ROLE_SERVICE.NOT_FOUND'));
    }
    role.name = data.name.toLowerCase();
    role.permissions = data.permissions;
    await role.save();
    return null;
  }

  async deleteRole(_id, i18n) {
    const isRole = await RoleModel.findById(_id);
    if (!isRole) {
      throw ApiError.BadRequerest(i18n.t('ROLE_SERVICE.NOT_FOUND'));
    }
    await userService.clearUserRole(_id);
    await RoleModel.deleteOne({ _id });
    return null;
  }

  async getAllRoles() {
    const roles = await RoleModel.find();
    return roles;
  }

  async getRolesList() {
    const roles = await RoleModel.find({}, { _id: true, name: true });
    return roles;
  }

  async getRoleName(id) {
    const role = await RoleModel.findOne({ _id: id }, { _id: true, name: true });
    return role;
  }
}

export default new RoleService();
