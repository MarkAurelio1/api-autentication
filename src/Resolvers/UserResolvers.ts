import { Field, InputType, Resolver, Query, Arg, Ctx, Mutation, ObjectType } from 'type-graphql'
import { Context } from '../libs/context'
import { User } from '../UserData/User'
import {hash, compare} from 'bcryptjs'
import {v4 as uuid} from 'uuid'
// Config do padrão a ser passando, quando houver, req, res do User
@InputType()
class UserInputData {
  @Field(() => [String])
  email: string

  @Field(() => [String])
  password: string
}

@ObjectType()
class UserWithToken{
    @Field(() => [String])
    user: User

    @Field(() => [String])
    token: string
}

@Resolver()
export class UserResolver {
  @Query((returns) => User, {nullable: true})
  async privateInfo
  (@Arg("token") token: string, 
  @Ctx() ctx:Context): Promise<User | null> {
    const dbToken = await ctx.prisma.tokens.findUnique({
        where: {token}, include: {user: true}})
    if(!dbToken) return null

    const {user} = dbToken
    return user
  }

  @Mutation((returns) => User)
  async singUp
   (@Arg("data") data: UserInputData,
   @Ctx() ctx: Context): Promise<User> {
    const hashedPassword = await hash(data.password, 10)
    return ctx.prisma.users.create({data: {...data, password: hashedPassword} })
  }

  @Mutation((returns) => UserWithToken)
  async login(@Arg("data") data:UserInputData,
  @Ctx() ctx: Context): Promise<User & { token: string} | null> {
    const user = await ctx.prisma.users.findUnique({
        where: {email: data.email}})

        if(!user) return null

        const validation = await compare(data.password, user.password)
        if (!validation) return null
        const tokenCode = uuid()
        const token = await ctx.prisma.tokens.create({
            data: {token: tokenCode, user: {connect: {id: user.id}}}})
        return {...user, token: token.token}
    }    
}
