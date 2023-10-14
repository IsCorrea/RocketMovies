const { Router } = require('express');
const usersRoutes = Router();
const UsersController = require('../controller/UsersController');
const usersController = new UsersController();

usersRoutes.post('/', usersController.create);
usersRoutes.put('/:id', usersController.update);


module.exports = usersRoutes;