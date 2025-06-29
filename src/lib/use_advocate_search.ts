import { Advocate } from "@/db/schema";
import { useCallback, useEffect, useState } from "react";

interface UseAdvocateSearchInputs {
  initialSearchTerm?: string;
  debounceTimeMs?: number;
}

export function useAdvocateSearch(inputs?: UseAdvocateSearchInputs) {
  const { initialSearchTerm = "", debounceTimeMs = 300 } = inputs ?? {};

  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [query, setQuery] = useState(searchTerm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(
    function () {
      const handler = setTimeout(() => {
        if (searchTerm !== query) {
          setQuery(searchTerm);
        }
      }, debounceTimeMs);

      return () => {
        clearTimeout(handler);
      };
    },
    [searchTerm, debounceTimeMs],
  );

  const doSearch = useCallback(
    async function () {
      setLoading(true);
      const { response, error: err } = await fetch(
        `/api/advocates?search=${encodeURIComponent(query)}`,
      )
        .then((res) => ({ response: res, error: undefined }) as const)
        .catch(
          (error) => ({ error: error as Error, response: undefined }) as const,
        );

      if (err) {
        setError(
          new Error(
            "An unexpected error occurred while fetching advocates. Please check your network connection and try again.",
          ),
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(new Error("Failed to fetch advocates"));
        setLoading(false);
        return;
      }

      const { json, error: jsonErr } = await response
        .json()
        .then(
          (json) =>
            ({ json: json as { data: Advocate[] }, error: undefined }) as const,
        )
        .catch(
          (error) => ({ error: error as Error, json: undefined }) as const,
        );
      if (jsonErr) {
        console.error("Error parsing JSON response:", jsonErr);
        setError(new Error("An unexpected error occurred"));
        setLoading(false);
        return;
      }

      // TODO: validate the response data
      setAdvocates(json.data ?? []);
      setLoading(false);
      setError(null);
    },
    [query],
  );

  useEffect(
    function () {
      doSearch();
    },
    [doSearch],
  );

  return {
    advocates,
    loading,
    error,
    searchTerm,
    search: setSearchTerm,
  };
}
