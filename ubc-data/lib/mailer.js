import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "UBCSchedules <onboarding@resend.dev>";
const TO = process.env.TO_EMAIL;

export async function sendBugReportEmail({ reporterEmail, description }) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    if (!TO) throw new Error("TO_EMAIL is not set");

    const { data, error } = await resend.emails.send({
        from: FROM,
        to: TO,
        subject: "Bug report — UBCSchedules",
        text: `Report from: ${reporterEmail}\n\n${description}`,
    });

    if (error) throw new Error(error.message || "Resend failed to send the email");
    return data;
}
