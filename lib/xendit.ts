import { Xendit, PaymentRequest as PaymentRequestClient } from 'xendit-node';

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || "",
});

export const { PaymentRequest } = xenditClient;
export default xenditClient;
