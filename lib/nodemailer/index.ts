import nodemailer from "nodemailer";
import {
  renderNewsSummaryEmail,
  renderVerificationEmail,
  renderWelcomeEmail,
} from "./render";

type WelcomeEmailData = {
  email: string;
  name: string;
  intro: string;
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

/** Display name plus address: a bare `"Signalist"` is not a valid sender. */
const FROM = `"Signalist" <${process.env.NODEMAILER_EMAIL}>`;

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Welcome to Signalist - Your stock market toolkit is ready!",
    text: "Thanks for joining Signalist",
    html: renderWelcomeEmail({ name, intro }),
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
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your email address for Signalist",
    text: `Hi ${name},\n\nOpen this link to verify your email address and activate your Signalist account (it expires in 1 hour):\n${url}\n\nYou did not create a Signalist account? You can safely ignore this email.`,
    html: renderVerificationEmail({ name, url }),
  });
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
  allowedUrls,
}: {
  email: string;
  date: string;
  newsContent: string;
  /** URLs of the articles given to the model: the only links kept. */
  allowedUrls: readonly string[];
}): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Signalist`,
    html: renderNewsSummaryEmail({ date, newsContent, allowedUrls }),
  });
};
