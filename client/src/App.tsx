import { useEffect, useState } from "react";
import EmailList from "./components/email-list";

export default function App() {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStoredEmails = async () => {
    // ideally we should use a library to fetch things as mutating and revalidating things can be easier
    const response = await fetch("http://localhost:3000/emails");
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Failed to fetch emails");
    }
    setEmails(data);
  };

  useEffect(() => {
    fetchStoredEmails();
  }, []);

  const handleFetchNewEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchResponse = await fetch("http://localhost:3000/fetch-emails");
      const fetchData = await fetchResponse.json();
      if (!fetchData.success) {
        throw new Error(fetchData.error);
      }
      await fetchStoredEmails();
      if (fetchData.emailsProcessed === 0) {
        setError("No new emails found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch new emails"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchStoredEmails();
    } catch (err) {
      setError("Failed to refresh emails");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <div className="space-x-4">
          <button
            onClick={handleFetchNewEmails}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
            {isLoading ? "Loading..." : "Fetch New Emails"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50">
            Refresh List
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <EmailList emails={emails} />
    </main>
  );
}
