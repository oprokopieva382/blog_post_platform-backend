import { Collection, Db, MongoClient } from "mongodb";
import { SETTINGS } from "../settings";
import {
  ApiDBType,
  BlogDBType,
  CommentDBType,
  PostDBType,
  SessionsDBType,
  UserDBType,
} from "./mongo_db_types";
import { logger } from "../utils/logger";
import mongoose from "mongoose";

let client: MongoClient = {} as MongoClient;
export let db: Db = {} as Db;
export let blogsCollection: Collection<BlogDBType> =
  {} as Collection<BlogDBType>;
export let postsCollection: Collection<PostDBType> =
  {} as Collection<PostDBType>;
export let usersCollection: Collection<UserDBType> =
  {} as Collection<UserDBType>;
export let commentsCollection: Collection<CommentDBType> =
  {} as Collection<CommentDBType>;
export let sessionsCollection: Collection<SessionsDBType> =
  {} as Collection<SessionsDBType>;
export let apiLimitCollection: Collection<ApiDBType> =
  {} as Collection<ApiDBType>;

export const ConnectMongoDB = async () => {
  try {
    //client = new MongoClient(SETTINGS.MONGO_DB_ATLAS);
    await mongoose.connect(`${SETTINGS.MONGO_DB_ATLAS}/${SETTINGS.DB_NAME}`);
    //await client.connect();
    logger.info("Connected to MongoDB Atlas");

    //db = client.db(SETTINGS.DB_NAME);

    blogsCollection = db.collection(SETTINGS.BLOGS_COLLECTION);
    postsCollection = db.collection(SETTINGS.POSTS_COLLECTION);
    usersCollection = db.collection(SETTINGS.USERS_COLLECTION);
    commentsCollection = db.collection(SETTINGS.COMMENTS_COLLECTION);
    sessionsCollection = db.collection(SETTINGS.SESSIONS_COLLECTION);
    apiLimitCollection = db.collection(SETTINGS.API_LIMIT_COLLECTION);
  
    return true;
  } catch (error) {
    logger.error(`Failed to connect MongoDB: ${error}`);
    //await client.close();
    await mongoose.disconnect();
    return false;
  }
};
