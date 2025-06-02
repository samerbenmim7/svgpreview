import { useState, useEffect } from "react";

const RECIPIENT_URL =
  "https://php-wunderpen-campaign-configurator.bi-dev2.de/api1/recipient.get/";

export default function useRecipient(
  recipientId: number | null,
  campaignId: number | null
) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchRecipient = async () => {
    if (recipientId == null || campaignId == null) return;

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(RECIPIENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaignId,
          recipient_id: recipientId,
        }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json();
      if (!json.success) throw new Error("API returned success:false");

      setData(json.recipient);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /* refetch whenever the id changes */
  useEffect(() => {
    fetchRecipient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId, campaignId]);

  return { data, loading, error, refetch: fetchRecipient };
}
