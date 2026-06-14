import { Github, Linkedin, Download } from "lucide-react";
import { SOCIAL_LINKS } from "../constants/socialLinks";

function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden scroll-mt-10 pt-20 pb-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-7">
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-accent">
              Software Engineer
            </p>

            {/* Name */}
            <h1 className="font-display text-5xl lg:text-7xl font-medium leading-[1.05] text-ink">
              Ryan Saperstein
            </h1>

            {/* Lede */}
            <p className="text-xl lg:text-2xl text-ink leading-snug max-w-xl">
              I build the app that runs youth sports leagues — the one coaches,
              parents, and players actually open on game day.
            </p>

            {/* Supporting copy */}
            <p className="text-base lg:text-lg text-muted leading-relaxed max-w-xl">
              Northeastern grad, previously at the Broad Institute and VMware. I
              like software that holds up under real-world mess. On the side,
              I'm building Phoenix, a programming language written from scratch
              in Rust.
            </p>

            {/* Now line + role tags */}
            <div className="space-y-3 border-l-2 border-accent/40 pl-4">
              <p className="text-sm text-muted">
                <span className="text-ink font-medium">Now</span>: building
                Playbook's all-in-one platform for leagues, coaches, and
                parents.
              </p>
              <p className="text-sm text-muted">
                React
                Native&nbsp;&middot;&nbsp;Rust&nbsp;&middot;&nbsp;Programming
                languages
              </p>
            </div>

            {/* CTA + Social Links */}
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <a
                href="/RyanSapersteinResume.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 border border-ink text-ink font-medium rounded-md hover:bg-ink hover:text-paper transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                Resume
              </a>
              <div className="flex items-center gap-2">
                <a
                  href={SOCIAL_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-muted hover:text-accent transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-muted hover:text-accent transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto">
              {/* Offset editorial frame instead of a gradient glow */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-lg border border-accent/40"></div>
              <img
                src="/ryanPhoto.jpg"
                className="relative rounded-lg w-full shadow-xl"
                alt="Ryan Saperstein"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
