const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId?: string;
  orderId: string;
  amount: number;
  discountAmount?: number;
  couponCode?: string;
  couponWarning?: string;
}

export const checkoutService = {
  createPaymentIntent: async (
    items: { productId: string; quantity: number }[],
    token: string,
    addressId?: string,
    couponCode?: string,
  ): Promise<CreatePaymentIntentResponse> => {
    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items,
        ...(addressId ? { addressId } : {}),
        ...(couponCode ? { couponCode } : {}),
      }),
    });

    if (!response.ok) {
      let errorData: any = null;
      const rawError = await response.text();

      try {
        errorData = rawError ? JSON.parse(rawError) : null;
      } catch {
        errorData = { error: rawError };
      }

      let errorMsg = 'Checkout failed';
      if (typeof errorData?.error === 'string') {
        errorMsg = errorData.error;
      } else if (Array.isArray(errorData?.error)) {
        errorMsg = errorData.error.join(', ');
      } else if (errorData?.error) {
        errorMsg = JSON.stringify(errorData.error);
      } else if (rawError) {
        errorMsg = rawError;
      }

      throw new Error(errorMsg);
    }

    return response.json();
  },
};
