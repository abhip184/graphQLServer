const graphql = require("graphql");
const {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean
} = graphql;
// const _ = require("lodash");
const Post = require("../models/post");
const Author = require("../models/author");

const postType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        // return _.find(authors, { id: parent.authorId });
        return Author.findById(parent.author);
      }
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    posts: {
      type: new GraphQLList(postType),
      resolve(parent, args) {
        return Post.find({ author: parent.id });
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    post: {
      // this is very important while retriving data in query
      type: postType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // here code to get data
        // args.id //args holds id and query to database
        return Post.findById(args.id);
      }
    },
    author: {
      // this is very important while retriving data in query
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // here code to get data
        // args.id //args holds id and query to database
        // return _.find(authors, { id: args.id });
        return Author.findById(args.id);
      }
    },

    posts: {
      // this is very important while retriving data in query
      type: new GraphQLList(postType),
      resolve(parent, args) {
        return Post.find({});
      }
    },

    filterPosts: {
      // this is very important while retriving data in query
      type: new GraphQLList(postType),
      args: { search: { type: GraphQLString }, reload: { type: GraphQLBoolean} },
      resolve(parent, args) {
        // here code to get data
        // args.id //args holds id and query to database
        console.log(args.search);
        return Post.find({ title: { $regex: args.search, $options: "i" } });
      }
    },

    authors: {
      // this is very important while retriving data in query
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        return Author.find({});

        // return authors;
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, args) {
        let author = new Author({
          name: args.name,
          age: args.age
        });
        return author.save();
      }
    },

    addPost: {
      type: postType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args) {
        let post = new Post({
          title: args.title,
          content: args.content,
          author: args.author
        });
        return post.save();
      }
    },

    deletePost: {
      type: postType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // here code to get data
        // args.id //args holds id and query to database
        // return _.find(authors, { id: args.id });
        // var postToDelete = Post.findById(args.id);
        return Post.findOneAndDelete({ _id: args.id });
      }
    }
  }
});
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
