import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationDots } from "./PaginationDots";

interface CarouselProps {
  images: string[];
  captions?: (string | null)[];
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);

    // Pause autoplay while user is interacting
    setIsPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }

    setIsDragging(false);

    // Resume autoplay if it was originally enabled
    if (autoplay) {
      setIsPlaying(true);
    }
  };

  // Calculate swipe progress for visual feedback
  const getSwipeTransform = () => {
    if (!isDragging || !touchStart || !touchEnd) return 0;
    const distance = touchStart - touchEnd;
    // Limit the transform to prevent excessive movement
    return Math.max(-100, Math.min(100, distance * 0.2));
  };

  const currentCaption = captions?.[currentIndex];

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      <div
        className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all ${
              isDragging ? "duration-0" : "duration-1000"
            } ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform:
                index === currentIndex && isDragging
                  ? `translateX(${getSwipeTransform()}px)`
                  : "translateX(0)",
            }}
          >
            {loadedImages.has(index) && (
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-contain select-none"
                draggable={false}
              />
            )}
          </div>
        ))}

        {/* Gradient overlays */}
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
          <PaginationDots
            total={images.length}
            current={currentIndex}
            onSelect={goToSlide}
            className={`absolute left-1/2 -translate-x-1/2 flex gap-2 ${
              currentCaption ? "bottom-20" : "bottom-4"
            }`}
          />
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
