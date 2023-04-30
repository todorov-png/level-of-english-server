/* eslint-disable */
import TeamModel from '../models/team-model.js';
import ApiError from '../exceptions/api-error.js';
import userService from '../service/user-service.js';
import crmService from '../service/crm-service.js';
import { encrypt } from '../helpers/encryption.js';

class TeamService {
  async createTeam(data, i18n) {
    data.name = data.name.toLowerCase();
    const isTeam = await TeamModel.findOne({ name: data.name });
    if (isTeam) {
      throw ApiError.BadRequerest(i18n.t('TEAM_SERVICE.HAS_ALREADY'));
    }
    const answer = await crmService.getAllOffers(data.bearer);
    if (answer === null) {
      throw ApiError.BadRequerest(i18n.t('TEAM_SERVICE.BEARER_INVALID'));
    }
    data.bearer = encrypt(data.bearer);
    const team = await TeamModel.create(data);
    return team;
  }

  async updateTeam(data, i18n) {
    const team = await TeamModel.findById(data._id);
    if (!team) {
      throw ApiError.BadRequerest(i18n.t('TEAM_SERVICE.NOT_FOUND'));
    }
    data.name = data.name.toLowerCase();
    const isTeam = await TeamModel.findOne({ name: data.name });
    if (isTeam && isTeam._id.toString() !== team._id.toString()) {
      throw ApiError.BadRequerest(i18n.t('TEAM_SERVICE.HAS_ALREADY'));
    }
    if (data.bearer) {
      const answer = await crmService.getAllOffers(data.bearer);
      if (answer === null) {
        throw ApiError.BadRequerest(i18n.t('TEAM_SERVICE.BEARER_INVALID'));
      } else {
        team.bearer = encrypt(data.bearer);
      }
    }
    team.name = data.name;
    team.linkTg = data.linkTg;
    await team.save();
    return null;
  }

  async deleteTeam(_id, i18n) {
    const isTeam = await TeamModel.findById(_id);
    if (!isTeam) {
      throw ApiError.BadRequerest(i18n.t('TEAM_SERVICE.NOT_FOUND'));
    }
    await userService.clearUserTeam(_id);
    await TeamModel.deleteOne({ _id });
    return null;
  }

  async getAllTeams() {
    const teams = await TeamModel.find({}, { _id: true, name: true, members: true, linkTg: true });
    return teams;
  }

  async getTeamsList() {
    const teams = await TeamModel.find({}, { _id: true, name: true });
    return teams;
  }

  async getTeamName(id) {
    const team = await TeamModel.findOne({ _id: id }, { _id: true, name: true });
    return team;
  }

  async incCommandCounter(id) {
    await TeamModel.updateOne({ _id: id }, { $inc: { members: 1 } });
    return null;
  }

  async  decCommandCounter(id) {
    await TeamModel.updateOne({ _id: id }, { $inc: { members: -1 } });
    return null;
  }
}
export default new TeamService();
