import { Controller, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

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
  async getAllUsers(email: string) {
    return await this.userService.findByEmail(email);
  }

  @MessagePattern({cmd: "update_user"})
  async updateUser(data: User) {
    return await this.userService.create(data);
  }

  @MessagePattern({cmd: "delete_user"})
  async deleteUser(data: User) {
    return await this.userService.create(data);
  }

}
