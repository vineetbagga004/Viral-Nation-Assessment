import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: String!
    email: String!
    password: String!
  }

  type Movie {
    id: String!
    movieName: String!
    description: String!
    directorName: String!
  }

  type Query {
    allMovies: [Movie!]
    movies(search: String!): [Movie!]!
    movie(id: String!): Movie
    allUsers: [User!]!
    user(id: String!): User
  }

  type Mutation {
    signUp(email: String!, password: String!): String!
    login(email: String!, password: String!): String!
    createMovie(
      movieName: String!
      description: String!
      directorName: String!
    ): Movie!
    updateMovie(
      id: String!
      movieName: String
      description: String
      directorName: String
    ): Movie!
    deleteMovie(id: String!): Movie!
  }
`;