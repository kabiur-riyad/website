"use client";

import { useState } from "react";

type Props = {
  email?: string;
  enabled: boolean;
};

export default function ContactForm({ email, enabled }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  if (!enabled) {
    return null;
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("sending");
        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.get("name"),
              email: formData.get("email"),
              message: formData.get("message"),
            }),
          });

          if (!res.ok) throw new Error("Failed");
          setStatus("sent");
          form.reset();
        } catch {
          setStatus("error");
        }
      }}
    >
      <input name="name" placeholder="Name" required />
      <input name="email" placeholder="Email" type="email" required />
      <textarea name="message" placeholder="Message" rows={5} required />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
      {status === "sent" ? (
        <p>Thanks — I will reply soon.</p>
      ) : null}
      {status === "error" ? (
        <p>Something went wrong. Try again or email directly.</p>
      ) : null}
    </form>
  );
}
