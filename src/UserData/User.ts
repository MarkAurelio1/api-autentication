import { Field, ObjectType, ID } from 'type-graphql'
import { IsEmail } from 'class-validator'
// Configurando Data Model
@ObjectType()
export class User {
  @Field((type) => ID)
  id: string

  @Field(() => [String])
  @IsEmail()
  email: string

  @Field((type) => String)
  password: string

  @Field((type) => Date)
  createdAt: Date
}
