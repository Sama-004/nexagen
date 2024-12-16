import express from "express";
import db from "./db";
import { emails } from "./db/schema";
import { simpleParser } from "mailparser";
import Imap from "node-imap";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const imapConfig = {
  user: process.env.EMAIL || "",
  password: process.env.EMAIL_PASSWORD || "",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

const imap = new Imap(imapConfig);

function processEmail(stream: any) {
  return new Promise((resolve, reject) => {
    simpleParser(stream, async (err, parsed) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        await db.insert(emails).values({
          sender: parsed.from?.text || "",
          subject: parsed.subject || "",
          timestamp: parsed.date?.getTime() || new Date().getTime(),
          messageId: parsed.messageId || "",
        });
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function fetchEmails() {
  return new Promise((resolve, reject) => {
    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        imap.search(["UNSEEN", ["SINCE", "Dec 15 2024"]], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results.length) {
            console.log("No unread emails");
            resolve([]);
            return;
          }

          const fetch = imap.fetch(results, { bodies: "" });
          const promises: Promise<any>[] = [];

          fetch.on("message", (msg) => {
            const promise = new Promise((resolve) => {
              msg.on("body", (stream) => {
                processEmail(stream).then(resolve).catch(console.error);
              });
            });
            promises.push(promise);
          });

          fetch.once("error", (err) => {
            reject(err);
          });

          fetch.once("end", () => {
            Promise.all(promises).then(resolve).catch(reject);
          });
        });
      });
    });

    imap.once("error", (err) => {
      reject(err);
    });

    imap.connect();
  });
}

async function main() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  app.get("/fetch-emails", async (req, res) => {
    try {
      const emails: any = await fetchEmails();
      res.json({ success: true, emailsProcessed: emails.length });
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ success: false, error: "Failed to fetch emails" });
    }
  });

  app.get("/emails", async (req, res) => {
    try {
      const storedEmails = await db.select().from(emails);
      res.json(storedEmails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stored emails" });
    }
  });
}

main().catch(console.error);
