/* useRecipientCount.ts
   Fetches the recipient count for a campaign.
   Usage:
      const { count, loading, error, refresh } = useRecipientCount(67);
*/

import { useState, useEffect, useCallback } from "react";

interface CountResponse {
  success: boolean;
  count: number;
  ids: number[];
}

export default function useRecipientCount(campaignId: number | null) {
  const [count, setCount] = useState<number | null>(null);
  const [recipientIds, setRecipientIds] = useState<number[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  /** hit the API (memoised) */
  const fetchCount = useCallback(async () => {
    if (campaignId == null) return;

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(
        "https://php-wunderpen-campaign-configurator.bi-dev2.de/api1/recipient.getCount/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaign_id: campaignId }),
        }
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data: CountResponse = await resp.json();
      if (!data.success) throw new Error("API returned success:false");

      setCount(data.count);
      setRecipientIds(data.ids);
    } catch (err) {
      setError(err);
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  /** run once when campaignId becomes available */
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    recipientIds,
    count, // number | null
    loading, // boolean
    error, // unknown | null
    refresh: fetchCount, // manual re-fetch
  };
}
