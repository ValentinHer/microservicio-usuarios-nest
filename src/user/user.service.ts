import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RpcException } from '@nestjs/microservices';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>){}

  async create(user: CreateUserDto) {
    const existUser = await this.userRepository.existsBy({email: user.email});
    if(existUser) throw new RpcException({success: false, message: "El email ya se encuentra en uso"});

    const userSaved = await this.userRepository.save(user);

    if(!userSaved) throw new RpcException({success: false, message: "Error al guardar el usuario"});
    
    return { success: true, message: 'Usuario guardado exitosamente', data: userSaved };
  }

  async findById(id: string) {
    const existUser = await this.userRepository.findOneBy({id})
    if(!existUser) throw new RpcException({success: false, message: "Usuario no encontrado"});

    return existUser;
  }

  async findByEmail(email: string) {
    const existUser = await this.userRepository.findOneBy({email})
    if(!existUser) throw new RpcException({success: false, message: "Usuario no encontrado"});

    return existUser;
  }

  async getAll() {
    const users = await this.userRepository.find();

    return {success: true, message: "Usuarios recuperados exitosamente", data: users};
  }

  async updateUser(id: string, data: UpdateUserDto) {
    await this.findById(id);

    await this.userRepository.update(id, data);

    return {success: true, message: "Usuario actualizado exitosamente"};
  }

  async delete(id: string) {
    await this.findById(id);

    await this.userRepository.softDelete(id);

    return {success: true, message: "Usuario eliminado exitosamente"};
  }
}
