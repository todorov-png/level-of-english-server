import { Router } from 'express';
import UserController from '../controllers/user-controller.js';
import AdminController from '../controllers/admin-controller.js';
import authMiddleware from '../middlewares/auth-middleware.js';
import permissionMiddleware from '../middlewares/permission-middleware.js';

const router = new Router();

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);
router.post('/activation-code', authMiddleware, UserController.sendNewActivationCode);
router.put('/user-update', authMiddleware, UserController.updateUser);
router.get('/lands', authMiddleware, UserController.getLands);

router.get(
  '/roles',
  authMiddleware,
  permissionMiddleware.bind(['createRole', 'deleteRole']),
  AdminController.fetchRoles
);
router.get(
  '/roles-list',
  authMiddleware,
  permissionMiddleware.bind(['assignRole']),
  AdminController.fetchRolesList
);
router.delete(
  '/roles',
  authMiddleware,
  permissionMiddleware.bind(['deleteRole']),
  AdminController.deleteRoles
);
router.post(
  '/role',
  authMiddleware,
  permissionMiddleware.bind(['createRole']),
  AdminController.createRole
);
router.put(
  '/role',
  authMiddleware,
  permissionMiddleware.bind(['createRole']),
  AdminController.updateRole
);
router.delete(
  '/role',
  authMiddleware,
  permissionMiddleware.bind(['deleteRole']),
  AdminController.deleteRole
);

router.get(
  '/teams',
  authMiddleware,
  permissionMiddleware.bind(['createTeam', 'deleteTeam']),
  AdminController.fetchTeams
);
router.get(
  '/teams-list',
  authMiddleware,
  permissionMiddleware.bind(['assignTeam']),
  AdminController.fetchTeamsList
);
router.post(
  '/team',
  authMiddleware,
  permissionMiddleware.bind(['createTeam']),
  AdminController.createTeam
);
router.put(
  '/team',
  authMiddleware,
  permissionMiddleware.bind(['createTeam']),
  AdminController.updateTeam
);
router.delete(
  '/team',
  authMiddleware,
  permissionMiddleware.bind(['deleteTeam']),
  AdminController.deleteTeam
);

router.get(
  '/users',
  authMiddleware,
  permissionMiddleware.bind(['assignRole', 'assignTeam', 'deleteUser']),
  AdminController.fetchUsers
);
router.post(
  '/user',
  authMiddleware,
  permissionMiddleware.bind(['createUser']),
  AdminController.createUser
);
router.put(
  '/user',
  authMiddleware,
  permissionMiddleware.bind(['assignRole', 'assignTeam']),
  AdminController.editUser
);
router.delete(
  '/user',
  authMiddleware,
  permissionMiddleware.bind(['deleteUser']),
  AdminController.deleteUser
);

export default router;
