import { apiClient } from "@/lib/api-client";
import { Payment, Purchase, CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest } from "@/types/payment";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const paymentService = {
  // v2.0: Backend auto-fetches price — only send item_id and item_type
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<any, ApiResponse<CreateOrderResponse>>("/payment/create-order", data),
  
  // v2.0: Verify Razorpay payment signature (Frontend Accelerator)
  verifyPayment: (data: VerifyPaymentRequest) =>
    apiClient.post<any, ApiResponse<Payment>>("/payment/verify", data),

  // v2.0: Get Payment Status (Webhook-first flow)
  getPaymentStatus: (orderId: string) =>
    apiClient.get<any, ApiResponse<{status: string, order_id: string, payment_id: string}>>(`/payments/status/${orderId}`),
  
  // v2.0: Get user's active purchases
  getMyPurchases: () =>
    apiClient.get<any, ApiResponse<Purchase[]>>("/payments/my-purchases"),
  
  // v2.0: Get full payment history
  getMyHistory: () =>
    apiClient.get<any, ApiResponse<Payment[]>>("/payments/my-history"),
  
  // Admin only
  getAllPurchases: (params?: any) =>
    apiClient.get<any, PaginatedResponse<any>>("/payments/purchases", { params }),
};
