export const XENDIT_API_VERSION = "2022-07-31";

export interface CreateQRCodeParams {
  referenceId: string;
  amount: number;
  currency: "IDR" | "PHP";
  expiresAt?: string;
  metadata?: Record<string, any>;
  channelCode?: string;
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
  private static getHeaders() {
    const apiKey = process.env.XENDIT_SECRET_KEY || "";
    if (!apiKey) throw new Error("XENDIT_SECRET_KEY is missing");
    const base64Key = Buffer.from(apiKey + ":").toString("base64");

    return {
      "Authorization": `Basic ${base64Key}`,
      "Content-Type": "application/json",
      "api-version": XENDIT_API_VERSION,
    };
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
      headers: this.getHeaders(),
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
}
