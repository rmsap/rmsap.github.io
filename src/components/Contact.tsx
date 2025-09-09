import { useState, useEffect, useRef } from "react";
import {
  Github,
  Linkedin,
  Mail,
  Send,
  MapPin,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

function Contact() {
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const email = "rmsaperstein@gmail.com";

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

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Email feedback handler (Suggestion 4)
  const handleEmailClick = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
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
      className="min-h-screen scroll-mt-10 py-10 px-4 sm:px-6 lg:px-8"
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
            I'm always interested in hearing about new opportunities,
            collaborating on exciting projects, or just having a great
            conversation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Contact Options */}
          <div
            className={`space-y-8 transition-all duration-700 transform ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* Email Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Primary
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Me</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Send me a message directly to my inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${email}`}
                  onClick={handleEmailClick}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </a>
                <button
                  onClick={handleCopyEmail}
                  aria-label={copied ? "Email copied" : "Copy email address"}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Email
                    </>
                  )}
                </button>
              </div>
              {emailSent && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Opening your email client...
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-4">
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
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group"
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

          {/* Right Column */}
          <div
            className={`lg:pl-8 transition-all duration-700 transform ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-100 dark:border-purple-800">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                What I'm Looking For
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Full-time opportunities in software engineering</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Interesting projects involving web development, AI, or data
                    visualization
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Collaborative teams working on impactful products</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Open source contributions and side projects</p>
                </div>
              </div>

              {/* Location/Timezone info */}
              <div className="mt-8 pt-6 border-t border-purple-200 dark:border-purple-700 flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                <MapPin className="w-4 h-4" />
                <span>New Jersey, USA</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Prefer a more casual chat?
              </p>
              <a
                href={`mailto:${email}?subject=Hello Ryan!&body=Hi Ryan,%0D%0A%0D%0AI found your portfolio and would love to connect!`}
                className="inline-flex items-center px-6 py-3 text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Just say hello 👋
                <Mail className="w-4 h-4 ml-2" />
              </a>
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
