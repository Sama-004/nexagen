import { Email } from "../types/email";
import EmailListItem from "./email-list-item";

interface EmailListProps {
  emails: Email[];
}

export default function EmailList({ emails }: EmailListProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {emails.map((email) => (
        <EmailListItem key={email.id} email={email} />
      ))}
    </div>
  );
}
