import axios, { AxiosError } from 'axios';

const BOLNA_BASE_URL = process.env.BOLNA_API_BASE_URL || 'https://api.bolna.dev';

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.BOLNA_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

export type TriggerCallParams = {
  agentId: string;
  phoneNumber: string;
  userData: {
    patient_name: string;
    doctor_name: string;
    appointment_date: string;
    appointment_time: string;
    department?: string;
  };
  webhookUrl: string;
};

export type CallResponse = {
  call_id?: string;
  execution_id?: string;
  status?: string;
  [key: string]: unknown;
};

export async function triggerCall(params: TriggerCallParams): Promise<CallResponse> {
  const payload = {
    agent_id: params.agentId,
    recipient_phone_number: params.phoneNumber,
    user_data: params.userData,
    context_data: params.userData,
    webhook_url: params.webhookUrl,
  };

  const response = await axios.post(
    `${BOLNA_BASE_URL}/call`,
    payload,
    { headers: getHeaders() }
  );
  return response.data;
}

export async function getExecution(executionId: string): Promise<Record<string, unknown>> {
  const response = await axios.get(
    `${BOLNA_BASE_URL}/execution/${executionId}`,
    { headers: getHeaders() }
  );
  return response.data;
}

export async function validateApiKey(): Promise<boolean> {
  try {
    await axios.get(`${BOLNA_BASE_URL}/agent/all`, { headers: getHeaders() });
    return true;
  } catch (e) {
    const err = e as AxiosError;
    if (err.response?.status === 401 || err.response?.status === 403) return false;
    return true;
  }
}

export function isBolnaConfigured(): boolean {
  const key = process.env.BOLNA_API_KEY;
  const agentId = process.env.BOLNA_AGENT_ID;
  return !!(
    key && agentId &&
    key !== 'your_bolna_api_key_here' &&
    agentId !== 'your_agent_id_here'
  );
}
