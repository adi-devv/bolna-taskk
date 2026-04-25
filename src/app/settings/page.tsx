'use client';

import { useState } from 'react';

const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookUrl = `${baseUrl}/api/webhook/bolna`;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure Bolna AI integration</p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Environment Configuration</h2>
        <p className="text-sm text-gray-500 mb-4">Add these to your <code className="bg-gray-100 px-1 rounded text-xs">.env.local</code> file</p>

        <div className="space-y-3">
          {[
            { key: 'BOLNA_API_KEY', value: 'your_bolna_api_key_here', desc: 'Get from Bolna Dashboard → Developers tab' },
            { key: 'BOLNA_AGENT_ID', value: 'your_agent_id_here', desc: 'Create an agent in Bolna and paste the ID here' },
            { key: 'BOLNA_API_BASE_URL', value: 'https://api.bolna.dev', desc: 'Bolna API base URL (default)' },
            { key: 'NEXT_PUBLIC_BASE_URL', value: baseUrl, desc: 'Your deployed URL (for webhooks)' },
          ].map(({ key, value, desc }) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-bold text-blue-700">{key}</code>
                <button
                  onClick={() => copy(`${key}=${value}`, key)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {copied === key ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <code className="text-xs text-gray-600 block">{value}</code>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook URL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Bolna Webhook URL</h2>
        <p className="text-sm text-gray-500 mb-3">Paste this URL in your Bolna agent&apos;s Tasks tab → Webhook URL</p>
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
          <code className="flex-1 text-sm text-blue-700 break-all">{webhookUrl}</code>
          <button
            onClick={() => copy(webhookUrl, 'webhook')}
            className="shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            {copied === 'webhook' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Bolna Agent Prompt */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Bolna Agent System Prompt</h2>
            <p className="text-sm text-gray-500">Use this prompt when creating your agent on Bolna</p>
          </div>
          <button
            onClick={() => copy(AGENT_PROMPT, 'prompt')}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {copied === 'prompt' ? '✓ Copied' : 'Copy Prompt'}
          </button>
        </div>
        <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap max-h-72 overflow-y-auto border border-gray-200">
          {AGENT_PROMPT}
        </pre>
      </div>

      {/* Setup Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-900 mb-3">Setup Guide</h2>
        <ol className="space-y-2 text-sm text-blue-800">
          <li><strong>1.</strong> Sign up at <strong>platform.bolna.ai</strong></li>
          <li><strong>2.</strong> Go to Developers tab → generate an API key → add to <code className="bg-blue-100 px-1 rounded text-xs">.env.local</code></li>
          <li><strong>3.</strong> Create a new agent → use the prompt above → set welcome message</li>
          <li><strong>4.</strong> In agent Tasks tab → set the webhook URL shown above</li>
          <li><strong>5.</strong> Copy the Agent ID → add to <code className="bg-blue-100 px-1 rounded text-xs">.env.local</code></li>
          <li><strong>6.</strong> Restart the dev server → you&apos;re live!</li>
        </ol>
      </div>
    </div>
  );
}

const AGENT_PROMPT = `You are an appointment reminder assistant for MediCall Clinic. Your task is to call patients and confirm their upcoming medical appointments.

## Instructions

When the call connects:
1. Greet the patient warmly: "Hello, may I please speak with {{patient_name}}?"
2. If they confirm: "Hi {{patient_name}}! This is an automated reminder call from MediCall Clinic."
3. State the appointment: "You have an appointment scheduled with {{doctor_name}} on {{appointment_date}} at {{appointment_time}}."
4. Ask for confirmation: "Will you be able to attend this appointment?"

## Response Handling

If the patient CONFIRMS:
- "Wonderful! We look forward to seeing you. Please arrive 10 minutes early and bring any previous medical reports."
- Set confirmation_status = "confirmed"

If the patient wants to CANCEL:
- "I understand. I'll make a note of your cancellation. Would you like us to call you to reschedule?"
- Set confirmation_status = "cancelled"

If the patient wants to RESCHEDULE:
- "Of course! Could you please tell me what date and time would work better for you?"
- Note their preference
- Set confirmation_status = "rescheduled", reschedule_preference = their preferred time

If NO ANSWER / VOICEMAIL:
- Leave a brief message: "Hello, this is a reminder from MediCall Clinic for {{patient_name}}'s appointment with {{doctor_name}} on {{appointment_date}} at {{appointment_time}}. Please call us back to confirm."
- Set confirmation_status = "no_answer"

## Data to Extract
- confirmation_status: "confirmed" | "cancelled" | "rescheduled" | "no_answer"
- reschedule_preference: patient's preferred alternative date/time (if rescheduling)
- notes: any other relevant patient feedback

Keep the conversation brief, professional, and empathetic. Do not discuss medical details.`;
