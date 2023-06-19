# Viral-Nation-Assessment

This is a GraphQL API for managing a list of movies. It allows users to sign up, log in, change passwords, and perform CRUD operations on movies. The API is built with Node.js, Apollo GraphQL, and PostgreSQL using the Prisma ORM. It includes authentication and authorization features using JWT tokens.


## Features

- User sign up
- User login
- Change password
- Get list of all movies
- Get a movie by ID
- Create a new movie if user is loggedIn
- Update an existing movie if logged in user is the one who created it
- Delete a movie if logged in user is the one who created it
- Sorting, filtering, and pagination for movie queries 
- Search functionality based on movie name, description or directorName
- Authentication using JWT tokens in headers
- Authorization for movie-related operations

## Technologies Used

- Node.js
- Apollo GraphQL
- PostgreSQL
- Prisma ORM
- JWT (JSON Web Tokens)
- bcrypt (for password hashing)

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
    npm install

### Configuration

1. Create a `.env` file in the project root directory.

2. Define the following environment variables in the `.env` file:
    PORT=<server-port>
    DATABASE_URL=<postgresql-database-url>
    APP_SECRET=<jwt-secret-key>

Replace `<server-port>` with the desired port number for the API server, `<postgresql-database-url>` with the URL of your PostgreSQL database, and `<jwt-secret-key>` with a secret key for JWT token signing.

### Running the API

First run the following command to setup prisma schema:
    npx prisma migrate dev
    prisma generate

To start the API server, run the following command:
    npm run start

The API will be accessible at `http://localhost:<server-port>`, where `<server-port>` is the port number specified in the `.env` file.

The API supports the following operations:

- `createUser`: Sign up a new user.
- `login`: Log in with email and password to obtain a JWT token.
- `changePassword`: Change the password of the authenticated user.
- `movies`: Get a list of all movies with support for sorting, filtering, and pagination.
- `movie`: Get a movie by its ID.
- `createMovie`: Create a new movie.
- `updateMovie`: Update an existing movie.
- `deleteMovie`: Delete a movie.


The API uses JWT (JSON Web Tokens) for authentication. To access the authenticated operations (create, update, delete movies), you need to include a valid JWT token in the `Authorization` header of your API requests.

The token should have the following format:
    Authorization: Bearer <JWT_TOKEN>

The API includes proper error handling and validation. In case of any errors, the API will return appropriate error responses with status codes and error messages.


