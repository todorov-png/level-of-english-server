/* eslint-disable */
import UserModel from '../models/user-model.js';
import UserDto from '../dtos/user-dto.js';
import mailService from './mail-service.js';
import roleService from './role-service.js';
import teamService from './team-service.js';
import tokenService from './token-service.js';
import ApiError from '../exceptions/api-error.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class UserService {
  async registration(username, email, password, i18n) {
    const isEmail = await UserModel.findOne({ email });
    if (isEmail) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.REGISTRATION.EMAIL'));
    }

    const isUsername = await UserModel.findOne({ username });
    if (isUsername) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.REGISTRATION.USERNAME'));
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = this.createActivationLink();
    const user = await UserModel.create({
      username,
      email,
      password: hashPassword,
      activationLink,
      registrationDate: Date.now(),
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`,
      i18n
    );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ id: user._id, username, email });
    await tokenService.saveToken(user._id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async activate(activationLink, i18n) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.ACTIVATE.LINK'));
    }
    user.isActivated = true;
    user.activationDate = Date.now();
    await user.save();
  }

  async login(email, password, i18n) {
    const user = await UserModel.findOne({ email }).populate('role', 'permissions');
    if (!user) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.LOGIN.NOT_USER'));
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.LOGIN.NOT_MATCH_PASSWORD'));
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ id: user._id, username: user.username, email });
    await tokenService.saveToken(user._id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id, {
      _id: true,
      username: true,
      email: true,
      isActivated: true,
      role: true,
      team: true,
    }).populate('role', 'permissions');
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({
      id: user._id,
      username: user.username,
      email: user.email,
    });
    await tokenService.saveToken(user._id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getUser(id) {
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.GET_USER.NOT_FOUND'));
    }
    return user;
  }

  async getUserTeamInfo(id) {
    const user = await UserModel.findOne({ _id: id }, { team: true }).populate('team');
    if (!user) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.GET_USER.NOT_FOUND'));
    }
    return user;
  }

  async createUser(username, email, password, role, team, i18n) {
    const isEmail = await UserModel.findOne({ email });
    if (isEmail) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.CREATE_USER.EMAIL'));
    }

    const isUsername = await UserModel.findOne({ username });
    if (isUsername) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.CREATE_USER.USERNAME'));
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = this.createActivationLink();
    if (team) {
      await teamService.incCommandCounter(team);
    }
    const date = Date.now();
    const user = await UserModel.create({
      username,
      email,
      role,
      team,
      password: hashPassword,
      activationLink,
      isActivated: true,
      activationDate: date,
      registrationDate: date,
    });
    return { _id: user._id, date };
  }

  async updateUser(refreshToken, data, i18n) {
    if (!data.password) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.UPDATE_USER.NOT_PASSWORD'));
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const isPassEquals = await bcrypt.compare(data.password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.UPDATE_USER.NOT_MATCH_PASSWORD'));
    }
    if (data.newPassword) user.password = await bcrypt.hash(data.newPassword, 3);
    if (data.username) user.username = data.username;
    if (data.email) user.email = data.email;

    await user.save();
    const userDto = new UserDto(user);
    return userDto;
  }

  createActivationLink() {
    const activationLink = uuidv4();
    return activationLink;
  }

  async getAllUsers() {
    const users = await UserModel.find(
      {},
      {
        _id: true,
        username: true,
        email: true,
        registrationDate: true,
        activationDate: true,
        role: true,
        team: true,
      }
    )
      .populate('role', ['name'])
      .populate('team', ['name']);
    return users;
  }

  async editUser(data, i18n) {
    const user = await UserModel.findOne(
      { _id: data.userId },
      { _id: true, username: true, email: true, role: true, team: true }
    );
    if (!user) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.EDIT_USER.NOT_FOUND'));
    }

    const responseUser = JSON.parse(JSON.stringify(user));
    const role = await roleService.getRoleName(data.roleId);
    const team = await teamService.getTeamName(data.teamId);

    if (user.team) {
      if (data.teamId) {
        if (user.team.toString() !== data.teamId.toString()) {
          await teamService.decCommandCounter(user.team);
          await teamService.incCommandCounter(data.teamId);
        }
      } else {
        await teamService.decCommandCounter(user.team);
      }
    } else if (data.teamId) {
      await teamService.incCommandCounter(data.teamId);
    }

    responseUser.role = role ? role : { name: '------', _id: null };
    responseUser.team = team ? team : { name: '------', _id: null };
    user.role = data.roleId;
    user.team = data.teamId;
    await user.save();

    return responseUser;
  }

  async deleteUser(_id, i18n) {
    const user = await UserModel.findById(_id);
    if (!user) {
      throw ApiError.BadRequerest(i18n.t('USER_SERVICE.DELETE_USER.NOT_FOUND'));
    }
    if (user.team) await teamService.decCommandCounter(user.team);
    await UserModel.deleteOne({ _id });
    return null;
  }

  async clearUserRole(_id) {
    await UserModel.updateMany({ role: _id }, { role: null });
    return null;
  }

  async clearUserTeam(_id) {
    await UserModel.updateMany({ team: _id }, { team: null });
    return null;
  }
}

export default new UserService();
