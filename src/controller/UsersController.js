const { hash, compare } = require('bcryptjs');
const AppError = require('../utils/AppError');
const knex = require('../database/knex');

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;
    const password_hash = await hash(password, 8);
    
    if (!name) {
      throw new AppError('Nome obrigatório');
    }
    
    const [userExists] = await knex.select('*').from('users').whereRaw('email = ?', [email])
    if (userExists) {
      throw new AppError('This email already exists');
    }
    
    const [user_id] = await knex('users').insert({
      name,
      email,
      password: password_hash,
    });

    response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;

    const user_id = request.user.id;

    const [user] = await knex.select('*').from('users').whereRaw('id = ?', [user_id])

    if(!user) {
      throw new AppError('User not found')
    }

    const [userWithUpdatedEmail] = await knex.select('*').from('users').whereRaw('email = ?', [email])
    
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== Number(user_id)) {
      throw new AppError('Email already used')
    }
    
    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if(password && !old_password) {
      throw new AppError('Old password not informed')
    }
    
    if(password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);
      
      if(!checkOldPassword) {
        throw new AppError('Wrong password')
      }
    }

      const password_hash = await hash(password, 8)

      const updated_at = `${new Date().toJSON().slice(0, 10)} ${new Date().toJSON().slice(11, 19)}`;

    await knex('users').update({
      name, 
      email,
      password: password_hash, 
      updated_at })
    .where({ id: user_id });

    return response.json();
  }
}

module.exports = UsersController;