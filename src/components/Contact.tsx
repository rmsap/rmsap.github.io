import { useState } from "react";
import type { FormEvent } from "react";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const WEB3FORMS_ACCESS_KEY = import.meta.env
  .VITE_WEB3FORMS_ACCESS_KEY as string;

type FormStatus = "idle" | "submitting" | "success" | "error";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!WEB3FORMS_ACCESS_KEY) {
      setFormStatus("error");
      return;
    }
    setFormStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          botcheck: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setFormStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setFormStatus("idle"), 5000);
      } else {
        setFormStatus("error");
        setTimeout(() => setFormStatus("idle"), 5000);
      }
    } catch {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/rmsap",
      username: "@rmsap",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "http://www.linkedin.com/in/ryansaperstein",
      username: "ryansaperstein",
    },
  ];

  return (
    <section id="contact" className="scroll-mt-10 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl lg:text-5xl font-medium mb-6 text-ink">
            Let's Connect
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Whether you want to talk mobile, language design, or something
            you're building, I'd like to hear from you. I read everything that
            comes through.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* Left Column - Contact Options */}
          <div className="flex flex-col">
            {/* Contact Form */}
            <div className="flex-1 min-h-0 bg-surface rounded-2xl p-6 border border-rule">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-accent-soft rounded-lg">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm text-muted">Get in touch</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-ink">
                Send a message
              </h3>
              <p className="text-muted mb-4">
                I'll get back to you as soon as I can
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-ink mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, name: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-rule bg-paper text-ink focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
                    placeholder="Your name"
                    disabled={formStatus === "submitting"}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-ink mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, email: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-rule bg-paper text-ink focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
                    placeholder="your@email.com"
                    disabled={formStatus === "submitting"}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-ink mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, message: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-rule bg-paper text-ink focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow resize-y min-h-[100px]"
                    placeholder="Your message..."
                    disabled={formStatus === "submitting"}
                  />
                </div>
                <input
                  type="checkbox"
                  name="botcheck"
                  className="hidden"
                  style={{ display: "none" }}
                />
                <button
                  type="submit"
                  disabled={
                    formStatus === "submitting" || !WEB3FORMS_ACCESS_KEY
                  }
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-accent text-paper rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formStatus === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send message
                    </>
                  )}
                </button>
                {formStatus === "success" && (
                  <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Message sent. I'll be in touch soon!
                  </p>
                )}
                {formStatus === "error" && (
                  <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {WEB3FORMS_ACCESS_KEY
                      ? "Something went wrong. Please try again."
                      : "Form is not configured. Set VITE_WEB3FORMS_ACCESS_KEY."}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col lg:pl-8">
            <div className="flex-1 min-h-0 bg-surface rounded-2xl p-8 border border-rule flex flex-col">
              {/* Keep this fresh — update the date and bullets whenever it changes.
                  The [bracketed] lines are placeholders for you to fill in. */}
              <div className="mb-5 flex items-baseline gap-3">
                <h3 className="font-display text-2xl font-medium text-ink">
                  Now
                </h3>
                <span className="text-xs uppercase tracking-wider text-muted">
                  Updated June 2026
                </span>
              </div>
              <div className="space-y-4 text-muted justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Shipping the Playbook Sports app, helping leagues, coaches,
                    and parents stay organized and connected.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Building Phoenix, a programming language written from
                    scratch in Rust, in my spare time.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Writing about software on the blog, from push notifications
                    to type systems.
                  </p>
                </div>
              </div>

              {/* Location/Timezone info */}
              <div className="mt-8 pt-6 border-t border-rule flex items-center space-x-2 text-muted mb-3">
                <MapPin className="w-4 h-4" />
                <span>New Jersey, USA</span>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-6 border-t border-rule space-y-4">
                <h3 className="text-lg font-semibold text-ink">
                  Find me online
                </h3>
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit my ${link.name} profile`}
                    className="flex items-center justify-between p-4 bg-paper border border-rule rounded-xl hover:border-accent/40 transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-surface rounded-lg">
                        <link.icon className="w-5 h-5 text-ink" />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{link.name}</p>
                        <p className="text-sm text-muted">{link.username}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-20 text-center px-4">
          <blockquote className="relative">
            <p className="font-display text-lg text-muted italic mx-auto">
              "Start by doing what's necessary; then do what's possible; and
              suddenly you are doing the impossible"
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export default Contact;
