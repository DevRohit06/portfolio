import type { APIRoute } from "astro";
import { Resend } from "resend";
import { RESEND_API_KEY, TURNSTILE_SECRET_KEY } from "astro:env/server";

// Mark as server-rendered (not static)
export const prerender = false;

// Use test secret key in development
const turnstileSecret = import.meta.env.PROD
  ? TURNSTILE_SECRET_KEY
  : "1x0000000000000000000000000000000AA"; // Cloudflare test key (always passes)

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: token,
      }),
    },
  );

  const data: TurnstileResponse = await response.json();
  return data.success;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, subject, message, turnstileToken } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const isValidToken = await verifyTurnstile(turnstileToken);
    if (!isValidToken) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification failed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Send email using Resend
    const resend = new Resend(RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Contact Form <portfolio@rohitk06.in>",
      to: ["rohitk290106@gmail.com"],
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${message}</div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from your portfolio contact form.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[API] Resend error:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[API] Contact form error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
