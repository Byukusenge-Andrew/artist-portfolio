import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";
import { sendContactInquiryEmail, sendContactAutoReplyEmail } from "@/lib/email";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(2, "Subject is required").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    const sanitizedData = {
      name: sanitizeText(name),
      email: sanitizeText(email),
      subject: sanitizeText(subject),
      message: sanitizeText(message),
    };

    // Attempt to send email notifications asynchronously with fallback resilience
    try {
      await Promise.allSettled([
        sendContactInquiryEmail(sanitizedData),
        sendContactAutoReplyEmail(sanitizedData.email, sanitizedData.name, sanitizedData.subject),
      ]);
    } catch (emailError) {
      console.warn("Contact email dispatch skipped or encountered an issue:", emailError);
      // We still return success to the customer so they are not blocked by dev/unconfigured SMTP
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received.",
    });
  } catch (error) {
    console.error("Error processing contact message:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending your message. Please try again." },
      { status: 500 }
    );
  }
}
