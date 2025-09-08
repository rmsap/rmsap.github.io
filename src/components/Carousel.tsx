import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  images: string[];
  captions?: string[];
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  autoplay?: boolean;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  captions,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  autoplay = true,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  // Preload images
  useEffect(() => {
    images.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(index));
      };
    });
  }, [images]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [isPlaying, goToNext, interval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNext, goToPrevious]);

  const currentCaption = captions?.[currentIndex];

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main carousel container */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {/* Images */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {loadedImages.has(index) && (
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        ))}

        {/* Gradient overlays for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Caption */}
        {currentCaption && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
            <p className="text-white text-center text-lg font-medium drop-shadow-lg">
              {currentCaption}
            </p>
          </div>
        )}

        {/* Navigation controls */}
        {showControls && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 group"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 group"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 flex gap-2 ${
              currentCaption ? "bottom-20" : "bottom-4"
            }`}
          >
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-purple-600"
                    : "w-2 bg-gray-400 hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image counter */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default Carousel;
