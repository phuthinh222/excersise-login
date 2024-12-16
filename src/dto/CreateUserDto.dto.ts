import { IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsEmpty()
    username: string

    @IsNotEmpty()
    password: string
}