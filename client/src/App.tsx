import { useEffect, useState } from "react";
import EmailList from "./components/email-list";

export default function App() {
  const [emails, setEmails] = useState([]);
  useEffect(() => {
    // ideally we should use a library to fetch things as mutating and revalidating things can be easier
    const fetchEmails = async () => {
      const response = await fetch("http://localhost:3000/emails");
      const data = await response.json();
      setEmails(data);
    };
    fetchEmails();
  }, []);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      <EmailList emails={emails} />
    </main>
  );
}
