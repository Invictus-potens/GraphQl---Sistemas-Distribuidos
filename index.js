import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// 1. "Banco de dados" em memória
const users = [
  { id: '1', name: 'Ettore Saburi', email: 'ettore@email.com', role: 'ADMIN' },
  { id: '2', name: 'Ana Souza', email: 'ana@email.com', role: 'AUTHOR' },
];

const posts = [
  { id: '1', title: 'Introdução ao GraphQL', content: '...', authorId: '1' },
  { id: '2', title: 'GraphQL vs REST', content: '...', authorId: '1' },
];

// 2. Schema (SDL)
const typeDefs = `#graphql
  enum Role { ADMIN AUTHOR READER }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String
    author: User!
  }

  input CreatePostInput {
    title: String!
    content: String
    authorId: ID!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts(limit: Int = 10): [Post!]!
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }
`;

// 3. Resolvers: uma função para cada campo
const resolvers = {
  Query: {
    users: () => users,
    user: (_parent, args) => users.find((u) => u.id === args.id),
    posts: (_parent, args) => posts.slice(0, args.limit),
  },
  Mutation: {
    createPost: (_parent, { input }) => {
      const post = { id: String(posts.length + 1), ...input };
      posts.push(post);
      return post;
    },
    deletePost: (_parent, { id }) => {
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) return false;
      posts.splice(index, 1);
      return true;
    },
  },
  // Resolvers de relacionamento
  User: {
    posts: (user) => posts.filter((p) => p.authorId === user.id),
  },
  Post: {
    author: (post) => users.find((u) => u.id === post.authorId),
  },
};

// 4. Sobe o servidor
const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`Servidor pronto em ${url}`);