export const XENDIT_API_VERSION = "2022-07-31";

export interface CreateQRCodeParams {
  referenceId: string;
  amount: number;
  currency: "IDR" | "PHP";
  expiresAt?: string;
  metadata?: Record<string, any>;
  channelCode?: string;
}

export interface CreateDisbursementParams {
  externalId: string;
  amount: number;
  bankCode: string;
  accountHolderName: string;
  accountNumber: string;
  description: string;
}

export interface XenditDisbursementResponse {
  id: string;
  external_id: string;
  user_id: string;
  amount: number;
  bank_code: string;
  account_holder_name: string;
  disbursement_description: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface XenditQRCodeResponse {
  id: string;
  reference_id: string;
  qr_string?: string;
  status: string;
  amount: number;
  business_id?: string;
  created?: string;
  updated?: string;
}

export class XenditService {
  private static getHeaders(extraHeaders: Record<string, string> = {}) {
    const apiKey = process.env.XENDIT_SECRET_KEY || "";
    if (!apiKey) throw new Error("XENDIT_SECRET_KEY is missing");
    const base64Key = Buffer.from(apiKey + ":").toString("base64");

    return {
      "Authorization": `Basic ${base64Key}`,
      "Content-Type": "application/json",
      "api-version": XENDIT_API_VERSION,
      ...extraHeaders,
    };
  }

  private static getCallbackHeader(path: string): Record<string, string> {
    const appUrl = process.env.APP_URL; // Required for dynamic webhooks (e.g. ngrok)
    if (!appUrl) return {};
    // Ensure no double slash if appUrl has trailing slash
    const baseUrl = appUrl.replace(/\/$/, "");
    return { "x-callback-url": `${baseUrl}${path}` };
  }

  static async createQRCode(params: CreateQRCodeParams): Promise<XenditQRCodeResponse> {
    const payload = {
      reference_id: params.referenceId,
      type: "DYNAMIC",
      currency: params.currency,
      amount: params.amount,
      channel_code: params.channelCode, // Optional
      metadata: params.metadata,
    };

    const response = await fetch("https://api.xendit.co/qr_codes", {
      method: "POST",
      headers: this.getHeaders(this.getCallbackHeader("/api/webhooks/xendit")),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Xendit Create QR Error:", errorBody);
      throw new Error(errorBody.message || "Failed to create QR Code");
    }

    return await response.json();
  }

  static async simulatePayment(externalId: string, amount: number) {
    // NOTE: externalId here refers to the Xendit 'external_id' which is our 'reference_id'.
    // If we need to simulate by 'qr_id', the endpoint is different?
    // Docs say: POST /qr_codes/{external_id}/payments/simulate
    // Usually Xendit allows both or strictly external_id. 
    // The user used reference_id (zavo-...) successfully for everything so far.

    const response = await fetch(`https://api.xendit.co/qr_codes/${externalId}/payments/simulate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Xendit Simulate Error:", errorBody);
      throw new Error(errorBody.message || "Simulation Failed");
    }

    return await response.json();
  }

  static async createDisbursement(params: CreateDisbursementParams): Promise<XenditDisbursementResponse> {
    const payload = {
      external_id: params.externalId,
      amount: params.amount,
      bank_code: params.bankCode,
      account_holder_name: params.accountHolderName,
      account_number: params.accountNumber,
      description: params.description,
    };

    const response = await fetch("https://api.xendit.co/disbursements", {
      method: "POST",
      headers: this.getHeaders(this.getCallbackHeader("/api/webhooks/xendit/disbursement")),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Xendit Disbursement Error:", errorBody);
      throw new Error(errorBody.message || "Failed to create disbursement");
    }

    return await response.json();
  }
}
