import { PaymentStatus, PURCHASE_STATUS } from "@/lib/constants";
import { User } from "./user";
import { Course } from "./course";
import { MockTest } from "./mock-test";

export interface Payment {
  _id: string;
  user: User | string;
  item_id: MockTest | Course | string;   // v2.0: generic item reference
  item_type: "MockTest" | "Course";       // v2.0: item type discriminator
  amount: number;
  currency: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  status: PaymentStatus;                  // v2.0: was `payment_status`
  createdAt: string;
  updatedAt: string;
  // Legacy fields (backward compat)
  course?: Course | string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface Purchase {
  _id: string;
  user: User | string;
  item_id: MockTest | Course | string;    // v2.0: populated when fetched
  item_type: "MockTest" | "Course";       // v2.0: item type discriminator
  payment: Payment | string;
  amount: number;
  status: "ACTIVE" | "EXPIRED" | "REFUNDED";
  purchase_date: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields
  course?: Course | string;
}

// ─── v2.0 Request/Response Types ───

export interface CreateOrderRequest {
  item_id: string;
  item_type: "MockTest" | "Course";
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface AccessCheckResponse {
  has_access: boolean;
  access_type: "free" | "paid";
  price: number;
  reason: string;
}
