import { InquiryStatus } from "@/lib/constants";
import { User } from "./user";

export interface InquiryReply {
  user: User | string;
  message: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Inquiry {
  _id: string;
  user: User | string;
  subject: string;
  message: string;
  status: InquiryStatus;
  replies: InquiryReply[];
  createdAt: string;
  updatedAt: string;
}
