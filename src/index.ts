import express from "express";
import db from "./db";
import { emails } from "./db/schema";
import { simpleParser } from "mailparser";
import Imap from "node-imap";
import dotenv from "dotenv";
import cors from "cors";
import { eq } from "drizzle-orm";

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

function processEmail(stream: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    simpleParser(stream, async (err, parsed) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const existingEmail = await db
          .select()
          .from(emails)
          .where(eq(emails.messageId, parsed.messageId || ""))
          .get();

        if (existingEmail) {
          console.log(
            `[${new Date().toISOString()}] Skip: Email with messageId ${
              parsed.messageId
            } already exists in database`
          );
          resolve(false);
          return;
        }

        await db.insert(emails).values({
          sender: parsed.from?.text || "",
          subject: parsed.subject || "",
          timestamp: parsed.date?.getTime() || new Date().getTime(),
          messageId: parsed.messageId || "",
        });
        console.log(
          `[${new Date().toISOString()}] Processed: Email from "${
            parsed.from?.text
          }" with subject "${parsed.subject}"`
        );

        resolve(true);
      } catch (error) {
        console.error("Error processing email:", error);
        reject(error);
      }
    });
  });
}

function fetchEmails() {
  return new Promise((resolve, reject) => {
    let processedCount = 0;
    const startTime = new Date().toISOString();
    console.log(`[${startTime}] Starting email fetch process...`);
    imap.once("ready", () => {
      imap.openBox("INBOX", false, async (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const results = await new Promise<number[]>(
            (searchResolve, searchReject) => {
              imap.search(
                ["UNSEEN", ["SINCE", "Dec 15 2024"]],
                (err, results) => {
                  if (err) searchReject(err);
                  else searchResolve(results);
                }
              );
            }
          );

          if (!results.length) {
            console.log(`[${new Date().toISOString()}] No unread emails`);
            imap.end();
            resolve(0);
            return;
          }

          console.log(
            `[${new Date().toISOString()}] Found ${
              results.length
            } unread emails`
          );

          const fetch = imap.fetch(results, { bodies: "", markSeen: false });
          const promises: Promise<any>[] = [];

          fetch.on("message", (msg, seqno) => {
            const promise = new Promise<boolean>((messageResolve) => {
              msg.on("body", async (stream) => {
                try {
                  const processed = await processEmail(stream);
                  if (processed) {
                    await new Promise<void>((flagResolve, flagReject) => {
                      imap.setFlags(results, ["\\Seen"], (err) => {
                        if (err) {
                          console.error(
                            `[${new Date().toISOString()}] Error marking message ${seqno} as read:`,
                            err
                          );
                          flagReject(err);
                        } else {
                          processedCount++;
                          flagResolve();
                        }
                      });
                    });
                  }
                  messageResolve(processed);
                } catch (error) {
                  console.error(
                    `[${new Date().toISOString()}] Error processing email:`,
                    error
                  );
                  messageResolve(false);
                }
              });
            });
            promises.push(promise);
          });

          fetch.once("error", (err) => {
            console.error(`[${new Date().toISOString()}] Fetch error:`, err);
            reject(err);
          });

          fetch.once("end", () => {
            Promise.all(promises)
              .then(() => {
                const endTime = new Date().toISOString();
                console.log(
                  `[${endTime}] Email fetch process completed. Processed ${processedCount} emails`
                );
                imap.end();
                resolve(processedCount);
              })
              .catch((err) => {
                console.error(
                  `[${new Date().toISOString()}] Error processing emails:`,
                  err
                );
                imap.end();
                reject(err);
              });
          });
        } catch (error) {
          console.error("Error in fetch process:", error);
          imap.end();
          reject(error);
        }
      });
    });

    imap.once("error", (err) => {
      console.error(
        `[${new Date().toISOString()}] IMAP connection error:`,
        err
      );
      reject(err);
    });

    imap.once("end", () => {
      console.log(`[${new Date().toISOString()}] IMAP connection ended`);
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
