// @ts-ignore
// don't know why lucide is giving module not found error but it works fine
import { Mail } from "lucide-react";
import { Email } from "../types/email";

interface EmailListItemProps {
  email: Email;
}

export default function EmailListItem({ email }: EmailListItemProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const extractSenderName = (sender: string) => {
    const match = sender.match(/"([^"]+)"/);
    return match ? match[1] : sender.split("<")[0].trim();
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
      <div className="flex-shrink-0 mr-4">
        <Mail className="h-6 w-6 text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {extractSenderName(email.sender)}
          </p>
          <p className="text-sm text-gray-500">{formatDate(email.timestamp)}</p>
        </div>
        <p className="text-sm text-gray-900 truncate">{email.subject}</p>
      </div>
    </div>
  );
}
