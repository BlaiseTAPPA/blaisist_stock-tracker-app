import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nodemailer, { type SendMailOptions } from "nodemailer";
import { appUrl } from "../app-url";
import { createUnsubscribeToken } from "../email/unsubscribe-token";
import {
  renderNewsSummaryEmail,
  renderPasswordResetEmail,
  renderVerificationEmail,
  renderWelcomeEmail,
} from "./render";

type WelcomeEmailData = {
  email: string;
  name: string;
  intro: string;
};

/**
 * End-to-end tests only: when set, emails are written as JSON files to this
 * folder instead of being sent, so a test can read the links they contain.
 * Never set it in a deployed environment.
 */
const OUTBOX_DIR = process.env.EMAIL_OUTBOX_DIR;

export const transporter = OUTBOX_DIR
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
      },
    });

/** Display name plus address: a bare `"FinGenius"` is not a valid sender. */
const FROM = `"FinGenius" <${process.env.NODEMAILER_EMAIL}>`;

const sendMail = async (mail: SendMailOptions): Promise<void> => {
  const info = await transporter.sendMail({ from: FROM, ...mail });
  if (OUTBOX_DIR) {
    await mkdir(OUTBOX_DIR, { recursive: true });
    const name = `${Date.now()}-${String(mail.to).replace(/[^\w.@-]/g, "_")}.json`;
    await writeFile(join(OUTBOX_DIR, name), String(info.message));
  }
};

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
  await sendMail({
    to: email,
    subject: "Welcome to FinGenius - Your stock market toolkit is ready!",
    text: "Thanks for joining FinGenius",
    html: renderWelcomeEmail({ name, intro, settingsUrl: appUrl("/settings") }),
  });
};

export const sendVerificationEmail = async ({
  email,
  name,
  url,
}: {
  email: string;
  name: string;
  url: string;
}): Promise<void> => {
  await sendMail({
    to: email,
    subject: "Verify your email address for FinGenius",
    text: `Hi ${name},\n\nOpen this link to verify your email address and activate your FinGenius account (it expires in 1 hour):\n${url}\n\nYou did not create a FinGenius account? You can safely ignore this email.`,
    html: renderVerificationEmail({ name, url }),
  });
};

export const sendPasswordResetEmail = async ({
  email,
  name,
  url,
}: {
  email: string;
  name: string;
  url: string;
}): Promise<void> => {
  await sendMail({
    to: email,
    subject: "Reset your FinGenius password",
    text: `Hi ${name},\n\nOpen this link to choose a new password for your FinGenius account (it expires in 1 hour and works once):\n${url}\n\nYou did not ask for this? You can safely ignore this email: your password stays the same.`,
    html: renderPasswordResetEmail({ name, url }),
  });
};

export const sendNewsSummaryEmail = async ({
  userId,
  email,
  date,
  newsContent,
  allowedUrls,
}: {
  userId: string;
  email: string;
  date: string;
  newsContent: string;
  /** URLs of the articles given to the model: the only links kept. */
  allowedUrls: readonly string[];
}): Promise<void> => {
  const token = encodeURIComponent(createUnsubscribeToken(userId, "digest"));

  await sendMail({
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from FinGenius`,
    html: renderNewsSummaryEmail({
      date,
      newsContent,
      allowedUrls,
      // The link opens a confirmation page: a GET never unsubscribes, so
      // link scanners can't unsubscribe anyone.
      unsubscribeUrl: appUrl(`/unsubscribe?token=${token}`),
      settingsUrl: appUrl("/settings"),
    }),
    // RFC 8058 one-click unsubscribe (the mail client's own button): a POST
    // to this URL with `List-Unsubscribe=One-Click` turns the digest off.
    // Rendered by Nodemailer as `List-Unsubscribe: <https://…>`.
    list: { unsubscribe: appUrl(`/api/unsubscribe?token=${token}`) },
    headers: { "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
};
