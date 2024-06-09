import { ObjectId } from "mongodb";

export type BlogDBType = {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt?: string;
  isMembership?: boolean;
};

export type PostDBType = {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt?: string;
};

export type UserDBType = {
  _id: ObjectId;
  login: string;
  password: string;
  email: string;
  createdAt: string;
  emailConfirmation: ConfirmationEmailType;
};

type ConfirmationEmailType = {
  confirmationCode: string;
  expirationDate: ExpirationDate;
  isConfirmed: boolean;
};

type ExpirationDate = Date;

export type CommentDBType = {
  _id: ObjectId;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
};

export type BlackListTokenDBType = {
   refreshToken: string;
};

export type SessionsDBType = {
  _id: ObjectId;
  userId: string;
  deviceId: string;
  iat: string;
  deviceName: string;
  ip: string;
  exp: string;
};

export type ApiDBType = {
  IP: string;
  URL: string;
  date: Date;
};
