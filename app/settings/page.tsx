"use client";

import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";

export default function SettingsPage() {
  const { data: config } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        
        <div className="bg-white rounded-lg shadow border p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Twilio Configuration</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Phone Number: {config?.twilioPhoneNumber || "Not configured"}
              </p>
              <p className="text-sm text-gray-600">
                WhatsApp Number: {config?.twilioWhatsAppNumber || "Not configured"}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Configure your Twilio credentials in the .env file
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>SMS/WhatsApp (Twilio)</span>
                <span className={config?.twilioConfigured ? "text-green-600" : "text-gray-400"}>
                  {config?.twilioConfigured ? "✓ Connected" : "Not configured"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Email (Resend)</span>
                <span className={config?.resendConfigured ? "text-green-600" : "text-gray-400"}>
                  {config?.resendConfigured ? "✓ Connected" : "Not configured"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

