import { Movie, PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { ValidatorOptions } from "class-validator";
import { AuthChecker } from "type-graphql";
import { ApolloError, AuthenticationError } from "apollo-server-express";


const saltRounds = 10;

const APP_SECRET = "your_app_secret";

const prisma = new PrismaClient();

export const resolvers = {
    Query: {
      allUsers: async () => {
        return prisma.user.findMany();
      },
      user: async (_, { id }: { id: string }) => {
        return prisma.user.findUnique({ where: { id } });
      },
      // movies: async () => {
      //   return prisma.movie.findMany();
      // },
  
      movies: async (
        _,
        { search }: { search?: string;}
      ) => {
        const where = {
          OR: [
            { movieName: { contains: search || "" } },
            { description: { contains: search || "" } },
            {directorName: { contains: search || "" }},
          ],
        };
  
        // if (filter === "recent") {
        //   return prisma.movie.findMany({
        //     where,
        //     orderBy: [{ releaseDate: "desc" }],
        //   });
        // } else if (filter === "oldest") {
        //   return prisma.movie.findMany({
        //     where,
        //     orderBy: [{ releaseDate: "asc" }],
        //   });
        // } else {
        //   return prisma.movie.findMany({ where });
        // }
        return prisma.movie.findMany({ where });
  
      },
      allMovies: async () => {
        return prisma.movie.findMany();
      },
      movie: async (_, { id }: { id: string }) => {
        return prisma.movie.findUnique({ where: { id } });
      },
    },
  
  
    Mutation: {
      signUp: async (_, { email, password }: User) => {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("hashed password: " + hashedPassword);
        const user = await prisma.user.create({
          data: { email, password: hashedPassword },
        });
        const token = jwt.sign({ userId: user.id }, APP_SECRET, {
          expiresIn: "1h",
        });
        return token;
      },
      login: async (
        _,
        { email, password }: { email: string; password: string }
      ) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("User does not exist");
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error("Invalid email or password");
        }
        const token = jwt.sign({ userId: user.id }, APP_SECRET, {
          expiresIn: "1h",
        });
        return token;
      },
      createMovie: async (_, args: Movie) => {
        return prisma.movie.create({ data: { ...args } });
      },
      updateMovie: async (
        _,
        { id, ...args }: { id: string } & Partial<Movie>,
        { req }
      ) => {
        const movie = await prisma.movie.findUnique({ where: { id } });
  
        if (!movie) {
          throw new ApolloError("Movie not found");
        }
  
        return prisma.movie.update({ where: { id }, data: { ...args } });
      },
      deleteMovie: async (_, { id }: { id: string }, { req }) => {
        const movie = await prisma.movie.findUnique({ where: { id } });
  
        if (!movie) {
          throw new ApolloError("Movie not found");
        }
  
        return prisma.movie.delete({ where: { id } });
      },
    },
  };