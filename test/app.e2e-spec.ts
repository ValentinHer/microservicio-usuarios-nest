import { StartedPostgreSqlContainer, PostgreSqlContainer } from "@testcontainers/postgresql";
import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { UserModule } from '../src/user/user.module';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/user/entities/user.entity';
import { firstValueFrom } from "rxjs";

describe('UserController (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:17.0')
      .withDatabase('testdb')
      .withUsername('test')
      .withPassword('test')
      .start();

    const pgPort = container.getMappedPort(5432); 
    const pgHost = container.getHost();
    const pgUser = container.getUsername();
    const pgPassword = container.getPassword();
    const pgDb = container.getDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "postgres",
          host: pgHost,
          port: pgPort,
          username: pgUser,
          password: pgPassword,
          database: pgDb,
          entities: [User],
          synchronize: true
        }),
        UserModule
      ],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: "127.0.0.1",
        port: 4000
      }
    });

    await app.listen();

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: "127.0.0.1",
        port: 4000
      }
    })

    await client.connect();
  });

  afterAll(async () => {
    if (client) await client.close();
    if (app) await app.close();
    if (container) await container.stop();
  })

  it('Should create a user', async () => {
    const data = {name: "test", email: "test@gmail.com", password: "test123"};

    const result = await firstValueFrom(client.send({cmd: "create_user"}, data));

    expect(result.success).toEqual(true);
    expect(result.data).toHaveProperty('id');
    expect(result.message).toEqual('Usuario guardado exitosamente');
    expect(result.data).toHaveProperty('name', 'test');
  });

  it('Should throw a validate error of validation types', async () => {
    const data = {email: "testtest2@gmail.com", password: "test123"};

    try {
      await firstValueFrom(client.send({cmd: "create_user"}, data));
      fail('La creación del usuario con tipos de datos inválidos no lanzó un error como se esperaba');
    } catch (err) {      
      expect(err).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('El nombre es requerido')
        ])
      )
    }

  });

  it('Should throw a error when the email already exists', async () => {
    const data = {name: "test", email: "test@gmail.com", password: "test123"};

    try {
      await firstValueFrom(client.send({ cmd: "create_user" }, data));
      fail('La creación duplicada no lanzó un error como se esperaba');
    } catch (err) {
      expect(err.success).toEqual(false);
      expect(err.message).toEqual('El email ya se encuentra en uso');
    }
  });

  it('Should retrieve a user by id', async() => {
    const data = {name: "testtwo", email: "testtwo@gmail.com", password: "testtwo123"};

    const result = await firstValueFrom(client.send({cmd: "create_user"}, data));

    const user = await firstValueFrom(client.send({cmd: "get_user_by_id"}, result.data.id));

    expect(user.id).toEqual(result.data.id);
    expect(user.email).toEqual(data.email);
  });

  it('Should throw a error when the user doesn´t exist by id', async () => {
    const id = "a0aaaa99-9a0a-4aa8-aa6a-6aa9aa293a22";

    try {
      await firstValueFrom(client.send({cmd: "get_user_by_id"}, id));
      fail('El get de un usuario en base al id no lanzó un error como se esperaba');
    } catch (err) {
      expect(err.success).toEqual(false);
      expect(err.message).toEqual('Usuario no encontrado');
    }
  });

  it('Should retrieve a user by email', async() => {
    const data = {name: "testthree", email: "testthree@gmail.com", password: "testthree123"};

    const result = await firstValueFrom(client.send({cmd: "create_user"}, data));

    const user = await firstValueFrom(client.send({cmd: "get_user_by_email"}, result.data.email));

    expect(user.id).toEqual(result.data.id);
    expect(user.email).toEqual(data.email);
  });

  it('Should throw a error when the user doesn´t exist by email', async () => {
    const email = "testtest@gmail.com";

    try {
      await firstValueFrom(client.send({cmd: "get_user_by_email"}, email));
      fail('El get de un usuario en base al email no lanzó un error como se esperaba');
    } catch (err) {
      expect(err.success).toEqual(false);
      expect(err.message).toEqual('Usuario no encontrado');
    }
  });

  it('Should get all users in db', async () => {
    const users = [
      {name: "test10", email: "test10@gmail.com", password: "test10123"},
      {name: "test11", email: "test11@gmail.com", password: "test11123"},
      {name: "test12", email: "test12@gmail.com", password: "test12123"},
      {name: "test13", email: "test13@gmail.com", password: "test13123"}
    ]

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await firstValueFrom(client.send({cmd: "create_user"}, user));
    }

    const usersFound = await firstValueFrom(client.send({cmd: "get_all_users"}, {}))

    expect(usersFound.success).toEqual(true);
    expect(usersFound.message).toEqual("Usuarios recuperados exitosamente");
    expect(usersFound.data).toEqual(expect.arrayContaining([
      expect.objectContaining({name: users[0].name, email: users[0].email}),
      expect.objectContaining({name: users[1].name, email: users[1].email}),
      expect.objectContaining({name: users[2].name, email: users[2].email}),
      expect.objectContaining({name: users[3].name, email: users[3].email}),
    ]));
  });

  it('Should update a user by id', async () => {
    const user = {name: "test20", email: "test20@gmail.com", password: "test20123"};
    const userSaved = await firstValueFrom(client.send({cmd: "create_user"}, user));

    const userUpdated = await firstValueFrom(client.send({cmd: "update_user"}, {id: userSaved.data.id, data: {name: "test21"}}));
    const userFound = await firstValueFrom(client.send({cmd: "get_user_by_id"}, userSaved.data.id));

    expect(userUpdated.success).toEqual(true);
    expect(userUpdated.message).toEqual("Usuario actualizado exitosamente");
    expect(userFound.name).toEqual("test21");
  });

  it('Should throw a error when the user doesn´t exist to update a user', async () => {
    const id = "a0aaaa99-9a0a-4aa8-aa6a-6aa9aa293a22";

    try {
      await firstValueFrom(client.send({cmd: "update_user"}, {id, data: {name: "usertest"}})); 
      fail("El update de un usuario en base al id no lanzó un error como se esperaba");
    } catch (err) {
      expect(err.success).toEqual(false);
      expect(err.message).toEqual("Usuario no encontrado"); 
    }
  });

  it('Should delete a user by id', async () => {
    const user = {name: "test30", email: "test30@gmail.com", password: "test30123"};
    const userSaved = await firstValueFrom(client.send({cmd: "create_user"}, user));

    const userDeleted = await firstValueFrom(client.send({cmd: "delete_user"}, userSaved.data.id));

    expect(userDeleted.success).toEqual(true);
    expect(userDeleted.message).toEqual("Usuario eliminado exitosamente");
  });

  it('Should throw a error when the user doesn´t exist to delete a user', async () => {
    const id = "a0aaaa99-9a0a-4aa8-aa6a-6aa9aa293a22";

    try {
      await firstValueFrom(client.send({cmd: "delete_user"}, id));
      fail("El delete de un usuario en base al id no lanzó un error como se esperaba");
    } catch (err) {
      expect(err.success).toEqual(false);
      expect(err.message).toEqual("Usuario no encontrado");
    }
  });

})
