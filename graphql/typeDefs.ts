import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: Int!
    userName: String!
    email: String!
    password: String!
  }

  type Movie {
    id: Int!
    movieName: String!
    description: String!
    directorName: String!
    releaseDate: String!
    createdBy: User!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    allMovies: [Movie!]
    searchMovies(search: String, filter: MovieFilterInput, startIndex: Int, limit: Int): [Movie!]!
    movie(id: Int!): Movie
  }

  input MovieFilterInput {
  directorName: String
}

  type Mutation {
    signUp(userName: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    createMovie(
      movieName: String!
      description: String!
      directorName: String!
      releaseDate: String!
    ): Movie!
    updateMovie(
      id: Int!
      movieName: String
      description: String
      directorName: String
      releaseDate: String
    ): Movie!
    deleteMovie(id: Int!): Movie!
    changePassword(currentPassword: String!, newPassword: String!): User!
  }
`;
