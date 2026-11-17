import nodemailer from "nodemailer";
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./templates";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );

  const mailOptions = {
    from: `"Signalist"`,
    to: email,
    subject: "Welcome to Signalist - Your stock market toolkit is ready!",
    text: "Thanks for joining Signalist",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
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
  // Function replacers: a `$` in the name or URL must not be read as a
  // replacement pattern.
  const html = VERIFY_EMAIL_TEMPLATE.replaceAll("{{name}}", () =>
    escapeHtml(name),
  ).replaceAll("{{url}}", () => escapeHtml(url));

  await transporter.sendMail({
    from: `"Signalist"`,
    to: email,
    subject: "Verify your email address for Signalist",
    text: `Hi ${name},\n\nOpen this link to verify your email address and activate your Signalist account (it expires in 1 hour):\n${url}\n\nYou did not create a Signalist account? You can safely ignore this email.`,
    html,
  });
};

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Signalist News"`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Signalist`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};