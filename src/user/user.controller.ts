import { Controller, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({cmd: "create_user"})
  async createUser(@Payload(new ValidationPipe({
    exceptionFactory(errors) {
        const messages = errors.map(err => {
          if(err.constraints) {
            return `${err.property} - ${Object.values(err.constraints).join(', ')}`;
          }
        });
        return new RpcException(messages);
    }
  })) data: CreateUserDto) {
    return await this.userService.create(data);
  }

  @MessagePattern({cmd: "get_user_by_id"})
  async getUserById(id: string) {
    return await this.userService.findById(id);
  }

  @MessagePattern({cmd: "get_user_by_email"})
  async getUserByEmail(email: string) {
    return await this.userService.findByEmail(email);
  }

  @MessagePattern({cmd: "get_all_users"})
  async getAllUsers() {
    return await this.userService.getAll();
  }

  @MessagePattern({cmd: "update_user"})
  async updateUser({id, data}: {id: string, data: UpdateUserDto}) {
    return await this.userService.updateUser(id, data);
  }

  @MessagePattern({cmd: "delete_user"})
  async deleteUser(id: string) {
    return await this.userService.delete(id);
  }

}
