import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICommentAttachment {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface ICommentReaction {
  emoji: string;
  user: Types.ObjectId;
}

export interface IComment extends Document {
  text: string;
  task: Types.ObjectId;
  author: Types.ObjectId;
  reactions: ICommentReaction[];
  attachments: ICommentAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    text: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reactions: [
      {
        emoji: { type: String },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
