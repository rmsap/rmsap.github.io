import { useState, useEffect } from "react";
import {
  Github,
  Linkedin,
  Mail,
  Download,
  ArrowDown,
  Code,
  Brain,
  Rocket,
  Sparkles,
} from "lucide-react";
import "./Hero.css";

function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState(0);

  const roles = [
    "Software Engineer",
    "Full-Stack Developer",
    "AI Enthusiast",
    "Problem Solver",
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToProjects = () => {
    const element = document.getElementById("projects");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden scroll-mt-10"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-32 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            {/* Greeting */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Welcome to my portfolio</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="text-gray-900 dark:text-gray-100">
                  Hello, I'm
                </span>
                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Ryan Saperstein
                </span>
              </h1>
            </div>

            {/* Dynamic Role */}
            <div className="h-16 flex items-center">
              <p className="text-2xl lg:text-3xl text-gray-700 dark:text-gray-300">
                <span className="transition-opacity duration-500">
                  {roles[currentRole]}
                </span>
              </p>
            </div>

            {/* Description */}
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Recent Northeastern graduate with experience at the{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Broad Institute
              </span>{" "}
              and{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                VMware
              </span>
              . Passionate about building scalable solutions, exploring AI
              applications, and creating impactful software.
            </p>

            {/* Tech Stack Icons */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full-Stack
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI/ML
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <Rocket className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Team Lead
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToProjects}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 inline-flex items-center justify-center gap-2"
              >
                View My Work
                <ArrowDown className="w-5 h-5" />
              </button>
              <a
                href="/resume.pdf"
                download
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                <Download className="w-5 h-5" />
                Download Resume
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4">
              <a
                href="https://github.com/rmsap"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:-translate-y-1"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </a>
              <a
                href="http://www.linkedin.com/in/ryansaperstein"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:-translate-y-1"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </a>
              <a
                href="mailto:rmsaperstein@gmail.com"
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:-translate-y-1"
                aria-label="Email"
              >
                <Mail className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </a>
            </div>
          </div>

          {/* Right Column - Image */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative group">
              {/* Decorative elements */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-1000"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-20 transition duration-300 animate-pulse"></div>

              {/* Main image */}
              <img
                src="/ryanPhoto.jpg"
                className="relative rounded-3xl w-full max-w-md mx-auto shadow-2xl"
                alt="Ryan Saperstein"
              />

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 animate-float">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  3.93 GPA
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Summa Cum Laude
                </p>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 animate-float animation-delay-2000">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  9+ Years
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Coding Experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <button
            onClick={scrollToProjects}
            className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors"
            aria-label="Scroll down"
          >
            <ArrowDown className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
