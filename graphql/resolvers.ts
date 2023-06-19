import { Movie, PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApolloError, ValidationError } from "apollo-server-express";
import moment from "moment";

const saltRounds = 10;

const APP_SECRET = process.env.APP_SECRET;

export const resolvers = {
  Query: {
    // Fetch a single movie using id
    movie: async (_, { id }: { id: number }, { prisma, userId }) => {
      const movie = await prisma.movie.findUnique({
        where: { id },
        include: { createdBy: true },
      });
      if (!movie) {
        throw new ApolloError("No movie found.");
      }
      movie.releaseDate = movie.releaseDate.toLocaleString().substring(0, 10);
      return movie;
    },

    // fetch all movies
    allMovies: async (_, args, { prisma, userId }) => {
      const movies = await prisma.movie.findMany({
        include: { createdBy: true },
      });
      if (!movies) {
        throw new ApolloError("No movies found.");
      }
      movies.forEach((movie) => {
        movie.releaseDate = movie.releaseDate.toLocaleString().substring(0, 10);
      });
      return movies;
    },

    // Fetch movies based on search(movieName, description, directorName)
    // filter based on directorName.
    // Includes pagination by passing startIndex , limit
    searchMovies: async (
      _,
      { search, filter, startIndex, limit },
      { prisma, userId }
    ) => {
      const { directorName } = filter || {};
      const where = {
        OR: [
          { movieName: { contains: search || "", mode: "insensitive" } },
          { description: { contains: search || "", mode: "insensitive" } },
          { directorName: { contains: search || "", mode: "insensitive" } },
        ],
        directorName: {
          contains: filter?.directorName || "",
          mode: "insensitive",
        },
      };
      const movies = await prisma.movie.findMany({
        where,
        skip: startIndex,
        take: limit,
        include: {
          createdBy: true,
        },
      });
      if (!movies) {
        throw new ApolloError("No movies found.");
      }
      movies.forEach((movie) => {
        movie.releaseDate = movie.releaseDate.toLocaleString().substring(0, 10);
      });
      return movies;
    },
  },

  // Mutations
  Mutation: {
    // SignUp resolver
    signUp: async (_, { userName, email, password }: User, { prisma }) => {
      const alreadyExists = await prisma.user.findUnique({ where: { email } });
      if (alreadyExists) {
        throw new ValidationError("User already exists");
      }
      if (password.length < 6) {
        throw new ValidationError("Password should have atleast 6 characters");
      }
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await prisma.user.create({
        data: { userName, email, password: hashedPassword },
      });
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        APP_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return { token, user };
    },

    // Login resolver
    login: async (
      _,
      { email, password }: { email: string; password: string },
      { prisma }
    ) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new ValidationError("User does not exist");
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new ValidationError("Incorrect password");
      }
      const token = jwt.sign({ data: { userId: user.id, email } }, APP_SECRET, {
        expiresIn: "1h",
      });
      return { user, token };
    },

    // Change password if jwt exists in the header
    changePassword: async (
      _,
      {
        currentPassword,
        newPassword,
      }: { currentPassword: string; newPassword: string },
      { prisma, userId }
    ) => {
      if (!userId) {
        throw new ApolloError("Not authorized");
      } else {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
          throw new ApolloError("User not found");
        }
        if (newPassword.length < 6) {
          throw new ValidationError(
            "Password should have atleast 6 characters"
          );
        }
        const passwordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );

        if (!passwordValid) {
          throw new ValidationError("Invalid current password");
        }
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        return updatedUser;
      }
    },

    // Create movie if jwt exists in the header
    createMovie: async (_, { ...data }: Movie, { prisma, userId }) => {
      if (!userId) {
        throw new ApolloError("Not authorized");
      } else {
        let releaseDateValid = moment(
          data.releaseDate,
          "YYY-MM-DD",
          true
        ).isValid();
        if (releaseDateValid) {
          data.releaseDate = new Date(data.releaseDate);
          const movie = await prisma.movie.create({
            data: {
              movieName: data.movieName,
              description: data.description,
              directorName: data.directorName,
              releaseDate: data.releaseDate,
              createdById: userId,
            },
            include: {
              createdBy: true,
            },
          });
          movie.releaseDate = movie.releaseDate.toLocaleString().substring(0, 10);
          return movie;
        } else {
          throw new ValidationError(
            'The format of release date should be "YYYY-MM-DD"'
          );
        }
      }
    },

    // Update movie if loggedin user is the one who created the movie
    updateMovie: async (
      _,
      { id, ...data }: { id: number } & Partial<Movie>,
      { prisma, userId }
    ) => {
      if (!userId) {
        throw new Error("Not authorized");
      } else {
        const movie = await prisma.movie.findUnique({ where: { id } });
        if (!movie) {
          throw new ApolloError("Movie not found");
        }
        if (movie.createdById !== userId) {
          throw new ApolloError("Unauthorized");
        }
        const updatedMovie = await prisma.movie.update({
          where: { id },
          data: { ...data },
          include: {
            createdBy: true,
          },
        });
        updatedMovie.releaseDate = updatedMovie.releaseDate.toLocaleString().substring(0, 10);
        return updatedMovie;
      }
    },

    // Delete movie if loggedin user is the one who created the movie
    deleteMovie: async (_, { id }: { id: number }, { prisma, userId }) => {
      if (!userId) {
        throw new Error("Not authorized");
      } else {
        const movie = await prisma.movie.findUnique({ where: { id } });
        if (!movie) {
          throw new ApolloError("Movie not found");
        }
        if (movie.createdById !== userId) {
          throw new ApolloError("Unauthorized");
        }
        const deletedMovie = await prisma.movie.delete({ where: { id } });
        deletedMovie.releaseDate = deletedMovie.releaseDate.toLocaleString().substring(0, 10);
        return deletedMovie;
      }
    },
  },
};
