import { Request } from "express";
import { HydratedDocument } from "mongoose";
import { IUser } from "../models/User.model.js";

declare global {
  namespace Express {
    interface Request {
      user: HydratedDocument<IUser>;
    }
  }
}
