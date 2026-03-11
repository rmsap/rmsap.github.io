import { useState, useEffect, useRef } from "react";
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

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY

type FormStatus = "idle" | "submitting" | "success" | "error";

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <section
      id="contact"
      className="scroll-mt-10 py-10 px-4 sm:px-6 lg:px-8"
    >
      <div
        ref={sectionRef}
        className={`max-w-6xl mx-auto transition-all duration-700 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Let's Connect
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            I'm always happy to connect — whether it's collaborating on projects,
            discussing ideas, or just having a great conversation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* Left Column - Contact Options */}
          <div
            className={`flex flex-col transition-all duration-700 transform ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* Contact Form */}
            <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Get in touch
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Send a message</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                I'll get back to you as soon as I can
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                    placeholder="Your name"
                    disabled={formStatus === "submitting"}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                    placeholder="your@email.com"
                    disabled={formStatus === "submitting"}
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((d) => ({ ...d, message: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow resize-y min-h-[100px]"
                    placeholder="Your message..."
                    disabled={formStatus === "submitting"}
                  />
                </div>
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
                <button
                  type="submit"
                  disabled={formStatus === "submitting" || !WEB3FORMS_ACCESS_KEY}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
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
          <div
            className={`flex flex-col lg:pl-8 transition-all duration-700 transform ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="flex-1 min-h-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-100 dark:border-purple-800 flex flex-col">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                What I'm Up To
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Building the Playbook Sports app—helping leagues, coaches, and parents stay organized and connected</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Open to collaboration, open source, and side projects</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Always happy to connect and chat about tech</p>
                </div>
              </div>

              {/* Location/Timezone info */}
              <div className="mt-8 pt-6 border-t border-purple-200 dark:border-purple-700 flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                <MapPin className="w-4 h-4" />
                <span>New Jersey, USA</span>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-6 border-t border-purple-200 dark:border-purple-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Find me online
                </h3>
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit my ${link.name} profile`}
                    className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg group-hover:shadow-md transition-shadow">
                        <link.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {link.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {link.username}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-20 text-center px-4">
          <blockquote className="relative">
            <p className="text-lg text-gray-500 dark:text-gray-400 italic mx-auto">
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
