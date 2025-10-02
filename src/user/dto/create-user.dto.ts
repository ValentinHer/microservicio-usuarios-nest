import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty({message: "El nombre es requerido"})
    @IsString({message: "El nombre debe de ser un cadena de texto"})
    name: string;

    @IsNotEmpty({message: "El email es requerido"})
    @IsEmail()
    email: string;

    @IsNotEmpty({message: "La contraseña es requerido"})
    @IsString({message: "La contraseña debe ser una cadena de texto"})
    password: string;
}
