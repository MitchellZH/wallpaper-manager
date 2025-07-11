"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Component() {
  const [isHydrated, setIsHydrated] = useState(false);

  const [wallpapers, setWallpapers] = useState([
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Modern Office",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1485322551133-3a4c27a9d925?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGxpYnJhcnl8ZW58MHx8MHx8fDA%3D",
      alt: "Home Library",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1480497490787-505ec076689f?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Mountain View",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "City Skyline",
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Clean Studio",
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1515860734122-e0d771b36d3e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Coffee Shop",
    },
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1570556319136-3cfc640168a4?q=80&w=2085&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Space Nebula",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [initialDistance, setInitialDistance] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 4.0;
  const ZOOM_SENSITIVITY = 0.6;

  const minSwipeDistance = 50;

  const [windowWidth, setWindowWidth] = useState(375);

  const [originalScrollPosition, setOriginalScrollPosition] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const getContainerWidth = () => {
    return containerRef.current?.clientWidth || windowWidth || 375;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isHydrated) return;

    if (e.touches.length === 2) {
      e.preventDefault();
      setIsZooming(true);
      const dist = getDistanceBetweenTouches(e);
      setInitialDistance(dist);
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        setIsPanning(true);
        setLastPanPosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      } else {
        setTouchStart(e.touches[0].clientX);
        setIsTransitioning(false);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isHydrated) return;

    if (isZooming && e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getDistanceBetweenTouches(e);
      const distanceRatio = currentDistance / initialDistance;

      const zoomDelta = (distanceRatio - 1) * ZOOM_SENSITIVITY;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scale * (1 + zoomDelta))
      );

      setScale(newScale);
      setInitialDistance(currentDistance);
    } else if (isPanning && e.touches.length === 1) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - lastPanPosition.x;
      const deltaY = e.touches[0].clientY - lastPanPosition.y;

      const maxPanX = (scale - 1) * 150;
      const maxPanY = (scale - 1) * 150;

      setPositionX(Math.max(-maxPanX, Math.min(maxPanX, positionX + deltaX)));
      setPositionY(Math.max(-maxPanY, Math.min(maxPanY, positionY + deltaY)));

      setLastPanPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    } else if (
      !isZooming &&
      !isPanning &&
      e.touches.length === 1 &&
      touchStart
    ) {
      setTouchEnd(e.touches[0].clientX);
      const currentOffset = e.touches[0].clientX - touchStart;

      const containerWidth = getContainerWidth();
      const maxOffset = containerWidth * 0.3;
      const resistance = 0.3;
      const limitedOffset =
        currentOffset > 0
          ? Math.min(currentOffset * resistance, maxOffset)
          : Math.max(currentOffset * resistance, -maxOffset);

      setSwipeOffset(limitedOffset);
    }
  };

  const navigateToImage = (direction: "next" | "prev") => {
    if (!isHydrated) return;

    setIsTransitioning(true);

    let newIndex;
    if (direction === "next") {
      newIndex = currentIndex === wallpapers.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? wallpapers.length - 1 : currentIndex - 1;
    }

    setTimeout(() => {
      setSwipeOffset(0);
      setTouchStart(0);
      setTouchEnd(0);

      setCurrentIndex(newIndex);

      setIsTransitioning(false);

      if (newIndex >= wallpapers.length - 3) {
        if (containerRef.current) {
          containerRef.current.style.transform = "";
          containerRef.current.style.left = "0";
          void containerRef.current.offsetHeight;
        }

        if (typeof document !== "undefined") {
          document.documentElement.style.width = "100vw";
          document.body.style.width = "100vw";
        }
      }
    }, 250);
  };

  const handleTouchEnd = () => {
    if (!isHydrated) return;

    if (isZooming) {
      setIsZooming(false);
    } else if (isPanning) {
      setIsPanning(false);
    } else if (!isZooming && !isPanning && touchStart && touchEnd) {
      if (scale === 1) {
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
          navigateToImage("next");
        } else if (isRightSwipe) {
          navigateToImage("prev");
        } else {
          setTouchStart(0);
          setTouchEnd(0);
          setSwipeOffset(0);
        }
      } else {
        setTouchStart(0);
        setTouchEnd(0);
        setSwipeOffset(0);
      }
    } else {
      setTouchStart(0);
      setTouchEnd(0);
      setSwipeOffset(0);
    }
  };

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    if (!isTransitioning) {
      setSwipeOffset(0);
    }
  }, [isTransitioning, isHydrated]);

  const getDistanceBetweenTouches = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return 0;

    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleDoubleTap = () => {
    if (!isHydrated) return;

    if (scale > 1) {
      setScale(1);
      setPositionX(0);
      setPositionY(0);
    } else {
      setScale(2.5);
      setPositionX(0);
      setPositionY(0);
    }
  };

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    if (galleryRef.current) {
      const thumbnails = galleryRef.current.children;
      if (thumbnails[currentIndex]) {
        thumbnails[currentIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex, isHydrated]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSwipeStart, setDrawerSwipeStart] = useState(0);
  const [drawerSwipeOffset, setDrawerSwipeOffset] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const DRAWER_WIDTH = 280;
  const DRAWER_SWIPE_THRESHOLD = 50;

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    if (!isHydrated) return;
    setDrawerSwipeStart(e.touches[0].clientX);
  };

  const handleDrawerTouchMove = (e: React.TouchEvent) => {
    if (!isHydrated) return;

    const currentX = e.touches[0].clientX;
    const deltaX = drawerSwipeStart - currentX;

    if (isDrawerOpen) {
      if (deltaX < 0) {
        const offset = Math.max(deltaX, -DRAWER_WIDTH);
        setDrawerSwipeOffset(offset);
      }
    } else {
      const touchStartFromRight = windowWidth - drawerSwipeStart;
      if (touchStartFromRight < 40 && deltaX > 0) {
        const offset = Math.min(deltaX, DRAWER_WIDTH);
        setDrawerSwipeOffset(offset);
      }
    }
  };

  const handleDrawerTouchEnd = () => {
    if (!isHydrated) return;

    if (isDrawerOpen) {
      if (drawerSwipeOffset < -DRAWER_SWIPE_THRESHOLD) {
        setIsDrawerOpen(false);
      }
    } else {
      if (drawerSwipeOffset > DRAWER_SWIPE_THRESHOLD) {
        setIsDrawerOpen(true);
      }
    }
    setDrawerSwipeOffset(0);
    setDrawerSwipeStart(0);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [wallpaperName, setWallpaperName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameError, setNameError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const handleUploadClick = () => {
    if (!isHydrated) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isHydrated) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setSelectedFiles(filesArray);
      setTotalFiles(filesArray.length);
      setCurrentUploadIndex(0);

      const initialName = filesArray[0].name.split(".")[0] || "";
      setWallpaperName(initialName.substring(0, 16));
      setShowNameInput(true);
      setUploadProgress(0);

      e.target.value = "";
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isHydrated) return;

    const value = e.target.value.substring(0, 16);
    setWallpaperName(value);

    if (value.trim()) {
      setNameError("");
    }
  };

  const handleNameSubmit = () => {
    if (!isHydrated) return;

    if (!wallpaperName.trim()) {
      setNameError("Please enter a name");
      return;
    }

    if (
      selectedFiles.length === 0 ||
      currentUploadIndex >= selectedFiles.length
    ) {
      return;
    }

    const currentFile = selectedFiles[currentUploadIndex];
    const imageUrl = URL.createObjectURL(currentFile);

    const newWallpaper = {
      id: Date.now() + currentUploadIndex,
      url: imageUrl,
      alt: wallpaperName.trim(),
    };

    setWallpapers((prev) => [...prev, newWallpaper]);

    const nextIndex = currentUploadIndex + 1;
    if (nextIndex < selectedFiles.length) {
      setCurrentUploadIndex(nextIndex);
      const nextName = selectedFiles[nextIndex].name.split(".")[0] || "";
      setWallpaperName(nextName.substring(0, 16));
      setUploadProgress(Math.round((nextIndex / selectedFiles.length) * 100));
    } else {
      setCurrentIndex(wallpapers.length);
      setSelectedFiles([]);
      setWallpaperName("");
      setShowNameInput(false);
      setUploadProgress(0);
      setTotalFiles(0);
      setIsDrawerOpen(false);
    }
  };

  const cancelUpload = () => {
    if (!isHydrated) return;

    setSelectedFiles([]);
    setWallpaperName("");
    setShowNameInput(false);
    setNameError("");
    setUploadProgress(0);
    setTotalFiles(0);
    setCurrentUploadIndex(0);
  };

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isDrawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const container = containerRef.current;

    const preventDefaultTouch = (e: TouchEvent) => {
      if (e.touches.length >= 2 || scale > 1) {
        e.preventDefault();
      }
    };

    if (container) {
      container.addEventListener(
        "touchstart",
        preventDefaultTouch as EventListener,
        { passive: false }
      );
      container.addEventListener(
        "touchmove",
        preventDefaultTouch as EventListener,
        { passive: false }
      );

      container.style.touchAction = "pan-x pan-y";
    }

    const style = document.createElement("style");
    style.innerHTML = `
      .prevent-zoom {
        touch-action: pan-x pan-y;
      }
      
      @media screen and (max-width: 768px) {
        html, body {
          touch-action: pan-x pan-y;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (container) {
        container.removeEventListener(
          "touchstart",
          preventDefaultTouch as EventListener
        );
        container.removeEventListener(
          "touchmove",
          preventDefaultTouch as EventListener
        );
      }

      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [scale, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    setScale(1);
    setPositionX(0);
    setPositionY(0);
    setSwipeOffset(0);
  }, [currentIndex, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes thumbnailPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      
      .thumbnail-active {
        animation: thumbnailPulse 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isHydrated]);

  const renderThumbnails = () => {
    if (!isHydrated) return null;

    const visibleCount = Math.min(5, wallpapers.length);
    const halfVisible = Math.floor(visibleCount / 2);

    let startIdx = Math.max(0, currentIndex - halfVisible);
    const endIdx = Math.min(wallpapers.length - 1, startIdx + visibleCount - 1);

    if (endIdx === wallpapers.length - 1) {
      startIdx = Math.max(0, wallpapers.length - visibleCount);
    }

    const visibleThumbnails = [];
    for (let i = startIdx; i <= endIdx; i++) {
      visibleThumbnails.push(
        <div
          key={`thumb-${wallpapers[i].id}`}
          className={`relative flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden ${
            currentIndex === i
              ? "border-2 border-pink-400 opacity-100 scale-105 shadow-lg ring-2 ring-purple-300 ring-opacity-50 thumbnail-active"
              : "border border-purple-200 opacity-80 hover:opacity-100"
          }`}
          style={{ width: "70px", height: "50px" }}
          onClick={() => setCurrentIndex(i)}
          role="button"
          tabIndex={0}
          aria-label={`Select wallpaper: ${wallpapers[i].alt}`}
          aria-current={currentIndex === i}
          onKeyDown={(e) => {
            if (e.key === "Enter") setCurrentIndex(i);
          }}
        >
          <Image
            src={wallpapers[i].url}
            alt={wallpapers[i].alt}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      );
    }

    return visibleThumbnails;
  };

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    if (containerRef.current) {
      containerRef.current.style.maxWidth = "calc(100vw - 48px)";
      containerRef.current.style.width = "calc(100% - 48px)";
      containerRef.current.style.margin = "0 auto";
      containerRef.current.style.transform = "none";
    }
  }, [currentIndex, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const handleResize = () => {
      document.body.style.width = "100vw";
      document.body.style.maxWidth = "100vw";
      document.body.style.padding = "0";
      document.body.style.margin = "0";
      document.documentElement.style.width = "100vw";
      document.documentElement.style.maxWidth = "100vw";
      document.documentElement.style.padding = "0";
      document.documentElement.style.margin = "0";
      document.documentElement.style.overflowX = "hidden";
      document.body.style.overflowX = "hidden";

      document.body.style.scrollbarWidth = "none";

      const style = document.createElement("style");
      style.textContent = `
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `;
      document.head.appendChild(style);

      const nextElements = document.querySelectorAll('[id^="__next"]');
      nextElements.forEach((el) => {
        (el as HTMLElement).style.width = "100vw";
        (el as HTMLElement).style.maxWidth = "100vw";
        (el as HTMLElement).style.padding = "0";
        (el as HTMLElement).style.margin = "0";
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const isLowPowerDevice = () => {
      const ua = navigator.userAgent;
      const isOlderDevice = /Android 4|Android 5|iPhone OS 9|iPhone OS 10/.test(
        ua
      );

      const hasLowMemory =
        "deviceMemory" in navigator && (navigator as any).deviceMemory < 4;

      const hasLowCPU =
        "hardwareConcurrency" in navigator && navigator.hardwareConcurrency < 4;

      return isOlderDevice || hasLowMemory || hasLowCPU;
    };

    const applyPerformanceOptimizations = () => {
      const perfStyle = document.createElement("style");

      let optimizations = `
        .prevent-zoom, 
        .transition-all, 
        .transition-transform, 
        .transition-opacity,
        .transition-filter {
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        
        img {
          image-rendering: auto;
        }
      `;

      if (isLowPowerDevice()) {
        optimizations += `
          * {
            transition-duration: 0.15s !important;
          }
          
          .shadow-md, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          
          .backdrop-blur-sm, .backdrop-blur-md, .backdrop-blur-lg {
            backdrop-filter: blur(2px) !important;
          }
          
          .bg-gradient-to-r, .bg-gradient-to-br, .bg-gradient-to-t {
            background: #6366f1 !important;
          }
        `;
      }

      perfStyle.textContent = optimizations;
      document.head.appendChild(perfStyle);

      const elements = document.querySelectorAll(".prevent-zoom, img, video");
      elements.forEach((el) => {
        const element = el as HTMLElement;
        element.style.transform = "translateZ(0)";
        element.style.backfaceVisibility = "hidden";
      });

      const images = document.querySelectorAll("img");
      if ("loading" in HTMLImageElement.prototype) {
        images.forEach((img) => {
          if (!img.hasAttribute("loading")) {
            img.setAttribute("loading", "lazy");
          }
        });
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const reducedMotionStyle = document.createElement("style");
        reducedMotionStyle.textContent = `
          * {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(reducedMotionStyle);
      }
    };

    applyPerformanceOptimizations();

    const handleOrientationChange = () => {
      setTimeout(applyPerformanceOptimizations, 300);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [isHydrated]);

  const [isGridExpanded, setIsGridExpanded] = useState(false);
  const [gridSwipeOffset, setGridSwipeOffset] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleGridTouchStart = (e: React.TouchEvent) => {
    if (!isHydrated) return;
    setTouchStart(e.touches[0].clientY);
    e.stopPropagation();
  };

  const handleGridTouchMove = (e: React.TouchEvent) => {
    if (!isHydrated || !touchStart) return;

    const currentY = e.touches[0].clientY;
    const deltaY = touchStart - currentY;

    const target = e.target as HTMLElement;
    const isDragHandle =
      target.classList.contains("bg-white/30") ||
      target.classList.contains(
        "flex justify-center items-center w-full pt-[8px] pb-[8px] absolute top-0"
      ) ||
      target.closest(
        ".flex.justify-center.items-center.w-full.pt-\\[8px\\].pb-\\[8px\\].absolute.top-0"
      ) !== null;

    if (isDragHandle) {
      const maxOffset = 300;
      const resistance = 0.8;
      const limitedOffset = Math.max(
        -maxOffset,
        Math.min(maxOffset, deltaY * resistance)
      );

      setGridSwipeOffset(limitedOffset);

    
      if (isGridExpanded && deltaY < -30) {
        handleGridExpansion(false);
        setTouchStart(0);
        setGridSwipeOffset(0);
      }
    }

    e.stopPropagation();
  };

  const handleGridTouchEnd = () => {
    if (!isHydrated) return;

    if (gridSwipeOffset !== 0) {
      if (gridSwipeOffset > 30) {
        handleGridExpansion(true);
      } else if (gridSwipeOffset < -30) {
        handleGridExpansion(false);
      }
    }

    setGridSwipeOffset(0);
    setTouchStart(0);
  };

  const handleGridExpansion = (expanded: boolean) => {
    if (!isHydrated || typeof window === "undefined") return;

    if (expanded) {
      const currentScrollPos =
        window.pageYOffset || document.documentElement.scrollTop;
      setOriginalScrollPosition(currentScrollPos);
    }

    setIsGridExpanded(expanded);

    if (expanded) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "auto",
      });

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });

        const gridContainer = document.querySelector(".grid-container");
        if (gridContainer) {
          gridContainer.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        setTimeout(() => {
          window.scrollTo({
            top: 999999,
            behavior: "auto",
          });
        }, 300);
      }, 50);
    } else {
      window.scrollTo({
        top: originalScrollPosition,
        behavior: "smooth",
      });
    }
  };

  const renderThumbnailGrid = () => {
    if (!isHydrated) return null;

    return (
      <div className="grid grid-cols-3 gap-3 pb-4 pt-2 px-2 md:grid-cols-4">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={`grid-${wallpaper.id}`}
            className={`relative cursor-pointer transition-all duration-300 rounded-lg overflow-hidden aspect-square ${
              currentIndex === index
                ? "border-2 border-pink-400 opacity-100 scale-105 shadow-lg ring-2 ring-purple-300 ring-opacity-50"
                : "border border-purple-200 opacity-80 hover:opacity-100"
            }`}
            onClick={() => {
              setCurrentIndex(index);
              setIsGridExpanded(false);
            }}
          >
            <Image
              src={wallpaper.url}
              alt={wallpaper.alt}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="font-nunito text-xs text-white truncate">
                {wallpaper.alt}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isHydrated) return;

    if (scale === 1) {
      setIsFullscreen(!isFullscreen);

      if (isFullscreen) {
        setScale(1);
        setPositionX(0);
        setPositionY(0);
      }
    }
  };

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isFullscreen, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const style = document.createElement("style");
    style.innerHTML = `
      .fullscreen-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-in-out;
        overflow: hidden;
      }
      
      .fullscreen-image-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      .fullscreen-image {
        max-width: 100%;
        max-height: 90vh;
        width: auto;
        height: auto;
        object-fit: contain;
        transition: transform 0.3s ease-out;
      }
      
      .fullscreen-image-prev {
        position: absolute;
        left: -100%;
        max-width: 100%;
        max-height: 90vh;
        width: auto;
        height: auto;
        object-fit: contain;
      }
      
      .fullscreen-image-next {
        position: absolute;
        right: -100%;
        max-width: 100%;
        max-height: 90vh;
        width: auto;
        height: auto;
        object-fit: contain;
      }
      
      .clickable-image {
        cursor: zoom-in;
      }
      
      .fullscreen-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
        z-index: 110;
      }
      
      .fullscreen-close:hover {
        background: rgba(0, 0, 0, 0.8);
      }
      
      .fullscreen-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
        z-index: 110;
      }
      
      .fullscreen-nav-prev {
        left: 20px;
      }
      
      .fullscreen-nav-next {
        right: 20px;
      }
      
      .fullscreen-nav:hover {
        background: rgba(0, 0, 0, 0.8);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInFromRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      
      @keyframes slideInFromLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      
      @keyframes slideOutToLeft {
        from { transform: translateX(0); }
        to { transform: translateX(-100%); }
      }
      
      @keyframes slideOutToRight {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isHydrated]);

  const [fullscreenTouchStart, setFullscreenTouchStart] = useState(0);
  const [fullscreenTouchEnd, setFullscreenTouchEnd] = useState(0);
  const [fullscreenSwipeOffset, setFullscreenSwipeOffset] = useState(0);
  const [fullscreenTransitioning, setFullscreenTransitioning] = useState(false);
  const [fullscreenSwipeDirection, setFullscreenSwipeDirection] = useState<
    "next" | "prev" | null
  >(null);

  const navigateFullscreenImage = (direction: "next" | "prev") => {
    if (!isHydrated) return;

    setFullscreenTransitioning(true);
    setFullscreenSwipeDirection(direction);

    let newIndex;
    if (direction === "next") {
      newIndex = currentIndex === wallpapers.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? wallpapers.length - 1 : currentIndex - 1;
    }

    setTimeout(() => {
      setFullscreenSwipeOffset(0);
      setFullscreenTouchStart(0);
      setFullscreenTouchEnd(0);
      setCurrentIndex(newIndex);
      setFullscreenTransitioning(false);
      setFullscreenSwipeDirection(null);
    }, 300);
  };

  const handleFullscreenTouchStart = (e: React.TouchEvent) => {
    if (!isHydrated) return;
    setFullscreenTouchStart(e.touches[0].clientX);
    e.stopPropagation();
  };

  const handleFullscreenTouchMove = (e: React.TouchEvent) => {
    if (!isHydrated || !fullscreenTouchStart) return;

    setFullscreenTouchEnd(e.touches[0].clientX);
    const currentOffset = e.touches[0].clientX - fullscreenTouchStart;

    const resistance = 0.8;
    const limitedOffset = currentOffset * resistance;

    setFullscreenSwipeOffset(limitedOffset);
    e.stopPropagation();
  };

  const handleFullscreenTouchEnd = () => {
    if (!isHydrated || !fullscreenTouchStart || !fullscreenTouchEnd) return;

    const distance = fullscreenTouchStart - fullscreenTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateFullscreenImage("next");
    } else if (isRightSwipe) {
      navigateFullscreenImage("prev");
    } else {
      setFullscreenSwipeOffset(0);
    }

    setFullscreenTouchStart(0);
    setFullscreenTouchEnd(0);
  };

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const style = document.createElement("style");
    style.innerHTML = `
      .grid-container {
        transition: height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        position: relative;
        scroll-margin-bottom: 0;
        scroll-snap-align: end;
      }
      
      .grid-container-expanded {
        height: 60vh;

        -webkit-overflow-scrolling: touch;
        z-index: 50;
        scroll-snap-stop: always;
      }
      
      .grid-container-collapsed {
        height: auto;
        overflow-y: hidden;
      }
      
      body.grid-expanded {
        overflow: hidden !important;
        position: fixed;
        width: 100%;
        height: 100%;
      }
      
      html.grid-expanded {
        overflow: hidden !important;
      }
      
      .smooth-scroll-container {
        scroll-behavior: smooth;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .smooth-scroll-container {
          scroll-behavior: auto;
        }
      }
      
      /* Rest of your existing CSS */
    `;
    document.head.appendChild(style);

    document.documentElement.classList.add("smooth-scroll-container");

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      document.documentElement.classList.remove("smooth-scroll-container");
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const scrollbarStyle = document.createElement("style");
    scrollbarStyle.textContent = `
      /* Hide scrollbar but allow scrolling */
      * {
        scrollbar-width: none; /* Firefox */
      }
      
      ::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Edge */
        width: 0px;
        background: transparent;
      }
      
      /* Add padding for Android devices */
      @supports (-webkit-touch-callout: none) {
        .fixed-right-button {
          right: 8px !important; /* Extra padding for Android */
        }
      }
      
      /* Ensure the button is always visible even with scrollbar */
      .fixed-right-button {
        margin-right: env(safe-area-inset-right, 8px);
        z-index: 40;
      }
      
      /* Prevent content from being hidden under scrollbar */
      body {
        padding-right: env(safe-area-inset-right, 0);
        overflow-x: hidden;
      }
    `;

    document.head.appendChild(scrollbarStyle);

    return () => {
      if (document.head.contains(scrollbarStyle)) {
        document.head.removeChild(scrollbarStyle);
      }
    };
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="font-nunito fixed inset-0 overflow-y-auto overflow-x-hidden m-0 p-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="font-nunito fixed inset-0 overflow-y-auto overflow-x-hidden m-0 p-0"
      style={{
        width: "100vw",
        maxWidth: "100vw",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        overflowY: isGridExpanded ? "hidden" : "auto",
      }}
    >
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1665652475985-37e285aeff53?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          width: "100vw",
          maxWidth: "100vw",
        }}
      ></div>

      <div
        className="w-full overflow-x-hidden"
        style={{ width: "100vw", maxWidth: "100vw" }}
      >
        <div
          className={`backdrop-blur-sm bg-black/20 w-full flex flex-col ${
            isDrawerOpen || drawerSwipeOffset > 0
              ? "blur-sm transition-all duration-300"
              : ""
          }`}
          style={{ width: "100%", maxWidth: "100%" }}
        >
          <nav
            className="backdrop-blur-sm bg-white/10 rounded-b-xl px-4 py-4 mx-2 flex items-center justify-center border border-white/20 shadow-lg"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
            }}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2">
                <span className="font-nunito text-white font-bold text-sm">
                  B
                </span>
              </div>
              <h1 className="font-nunito text-lg font-bold text-white">
                Backdrop
              </h1>
            </div>
          </nav>

          <div
            className="text-center backdrop-blur-sm bg-white/10 rounded-xl relative shadow-xl overflow-hidden mx-2 my-2 py-4 px-4 border border-white/20"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
            }}
          >
            <div className="relative">
              <h2 className="font-nunito text-2xl md:text-3xl font-bold mb-2 text-white">
                Virtual Background Manager
              </h2>
              <p className="text-white mb-4 max-w-md mx-auto text-xs md:text-sm">
                Create your perfect digital collection by uploading your very
                own backgrounds. Swipe, zoom, and customize your visual
                experience all in one place.
              </p>

              <div className="grid grid-cols-3 gap-1 max-w-xs sm:max-w-sm mx-auto mb-4">
                <div className="flex flex-col items-center p-2 bg-white/10 rounded-lg">
                  <div className="w-6 h-6 flex items-center justify-center bg-purple-500/30 rounded-full mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                      aria-hidden="true"
                    >
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  </div>
                  <span className="font-nunito text-xs text-white">
                    Pinch Zoom
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white/10 rounded-lg">
                  <div className="w-6 h-6 flex items-center justify-center bg-purple-500/30 rounded-full mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                      aria-hidden="true"
                    >
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <polyline points="23 20 23 14 17 14"></polyline>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                  </div>
                  <span className="font-nunito text-xs text-white">Swipe</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white/10 rounded-lg">
                  <div className="w-6 h-6 flex items-center justify-center bg-purple-500/30 rounded-full mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <span className="font-nunito text-xs text-white">Upload</span>
                </div>
              </div>

              <div className="flex flex-row justify-center gap-2 items-center max-w-xs sm:max-w-md mx-auto">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="font-nunito bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-md hover:opacity-90 transition-opacity flex items-center gap-1 text-xs"
                  aria-label="Upload new wallpaper"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload
                </button>
                <button
                  onClick={handleDoubleTap}
                  className="font-nunito border border-white text-white px-3 py-1 rounded-full hover:bg-white/20 transition-colors text-xs"
                  aria-label="Toggle zoom level"
                >
                  Toggle Zoom
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex justify-center items-center w-full py-4 overflow-hidden"
            style={{
              height: "60vh",
              position: "relative",
              width: "100%",
              maxWidth: "100%",
              padding: 0,
              margin: 0,
            }}
          >
            <div
              ref={containerRef}
              className={`relative overflow-hidden rounded-xl transition-filter duration-300 prevent-zoom ${
                isDrawerOpen || drawerSwipeOffset > 0 ? "blur-sm" : ""
              }`}
              style={{
                touchAction: "pan-x pan-y",
                height: "100%",
                width: "calc(100% - 16px)",
                maxWidth: "calc(100% - 16px)",
                margin: "0 8px",
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleTap}
              role="region"
              aria-label="Wallpaper viewer"
            >
              <div
                className="w-full h-full relative transition-transform duration-300"
                style={{
                  transform: `translateX(${
                    (swipeOffset / getContainerWidth()) * 100
                  }%) scale(${scale}) translate(${positionX / scale}px, ${
                    positionY / scale
                  }px)`,
                  transformOrigin: "center",
                  maxWidth: "100%",
                  cursor: scale === 1 ? "zoom-in" : "grab",
                }}
                onClick={() => {
                  if (scale === 1) toggleFullscreen();
                }}
              >
                {isHydrated && wallpapers[currentIndex] && (
                  <Image
                    src={wallpapers[currentIndex].url}
                    alt={wallpapers[currentIndex].alt}
                    fill
                    priority
                    className={`object-cover rounded-xl ${
                      scale === 1 ? "clickable-image" : ""
                    }`}
                    unoptimized
                    draggable={false}
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                )}
              </div>

              <div className="absolute bottom-8 left-8 inline-block bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-full text-sm shadow-md backdrop-blur-sm bg-opacity-70">
                <span className="font-nunito font-medium whitespace-nowrap">
                  {isHydrated && wallpapers[currentIndex]
                    ? wallpapers[currentIndex].alt
                    : "Cargando..."}
                </span>
              </div>

              {scale > 1 && (
                <div className="font-nunito absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
                  {Math.round(scale * 100)}%
                </div>
              )}

              {scale === 1 && (
                <>
                  <div
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => navigateToImage("prev")}
                    role="button"
                    tabIndex={0}
                    aria-label="Previous wallpaper"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigateToImage("prev");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </div>
                  <div
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => navigateToImage("next")}
                    role="button"
                    tabIndex={0}
                    aria-label="Next wallpaper"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigateToImage("next");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className={`backdrop-blur-sm bg-white/10 rounded-t-xl mx-2 mt-2 mb-2 shadow-inner transition-filter duration-300 border border-white/20 grid-container relative pt-[36px] overflow-hidden ${
              isGridExpanded
                ? "grid-container-expanded"
                : "grid-container-collapsed"
            } ${isDrawerOpen || drawerSwipeOffset > 0 ? "blur-sm" : ""}`}
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255,255,255,0.1) 100%)",
              boxShadow: "inset 0 8px 32px 0 rgba(31, 38, 135, 0.2)",
              transition: "height 0.3s ease-out, transform 0.2s ease-out",
              transform: gridSwipeOffset ? `translateY(-40px)` : "none",
              height: isGridExpanded ? "60vh" : "auto",
              position: isGridExpanded ? "sticky" : "relative",
              bottom: isGridExpanded ? "0" : "auto",
              zIndex: isGridExpanded ? "50" : "auto",
            }}
          >
            <div
              className="flex justify-center items-center w-full pt-[8px] pb-[8px] absolute top-0 z-10"
              onClick={() => handleGridExpansion(!isGridExpanded)}
              onTouchStart={handleGridTouchStart}
              onTouchMove={handleGridTouchMove}
              onTouchEnd={handleGridTouchEnd}
              role="button"
              tabIndex={0}
              aria-expanded={isGridExpanded}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGridExpansion(!isGridExpanded);
              }}
              style={{
                height: "36px",
                cursor: "pointer",
                touchAction: "none",
                transition: "transform 0.9s cubic-bezier(0.25, 0.1, 0.25, 1.2)",
              }}
            >
              <div
                className={`w-12 h-1 rounded-full mx-auto my-2 cursor-pointer ${
                  isGridExpanded
                    ? "bg-pink-400 scale-x-110"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                style={{
                  transform: gridSwipeOffset
                    ? `rotate(${gridSwipeOffset / 15}deg)`
                    : isGridExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition:
                    "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.5s ease, scale 0.5s ease",
                }}
                aria-label={
                  isGridExpanded ? "Collapse grid view" : "Expand grid view"
                }
              ></div>
            </div>

            <div
              ref={gridRef}
              className={` transition-opacity duration-300 ${
                isGridExpanded ? "opacity-0 h-0 p-0" : "opacity-100 p-3"
              }`}
              onTouchStart={handleGridTouchStart}
              onTouchMove={handleGridTouchMove}
              onTouchEnd={handleGridTouchEnd}
            >
              <div className="flex justify-center gap-2 pb-1" ref={galleryRef}>
                {renderThumbnails()}
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 overflow-hidden">
                <div className="flex flex-wrap justify-center gap-1 max-w-xs">
                  {isHydrated &&
                    wallpapers.map((_, index) => (
                      <div
                        key={`indicator-${index}`}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          currentIndex === index ? "bg-white" : "bg-white/40"
                        } cursor-pointer`}
                        onClick={() => setCurrentIndex(index)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Go to wallpaper ${index + 1}`}
                        aria-current={currentIndex === index}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setCurrentIndex(index);
                        }}
                      ></div>
                    ))}
                </div>
              </div>
              <div className={`text-white p-2 text-center`}>
                <p className="font-nunito text-xs text-white/60 mt-1">
                  Swipe up to view all wallpapers
                </p>
              </div>
            </div>

            <div
              className={`transition-opacity duration-300 overflow-y-scroll ${
                isGridExpanded
                  ? "opacity-100 h-full"
                  : "opacity-0 h-0 overflow-hidden h-0"
              }`}
              ref={isGridExpanded ? gridRef : undefined}
            >
              <div className="flex justify-between items-center px-4 py-2">
                <h3 className="font-nunito text-white font-medium">
                  All Wallpapers ({isHydrated ? wallpapers.length : 0})
                </h3>
                <button
                  onClick={() => handleGridExpansion(false)}
                  className="text-white/80 hover:text-white"
                  aria-label="Close grid view"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
              </div>
              {renderThumbnailGrid()}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed-right-button fixed top-1/2 right-0 transform -translate-y-1/2 z-40 ${
          isDrawerOpen || isGridExpanded
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        } transition-opacity duration-300`}
        onClick={() => setIsDrawerOpen(true)}
      >
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-24 w-5 rounded-l-md shadow-md flex items-center justify-center cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Open settings drawer"
          onKeyDown={(e) => {
            if (e.key === "Enter") setIsDrawerOpen(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transform rotate-180"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-full z-50 transition-opacity duration-300 ${
          isDrawerOpen || drawerSwipeOffset > 0
            ? "pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          width: isDrawerOpen || drawerSwipeOffset > 0 ? "100%" : "0",
        }}
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Settings drawer"
      >
        <div
          ref={drawerRef}
          className="absolute top-0 right-0 h-full bg-black/50 backdrop-blur-md border-l border-white/20 rounded-l-xl shadow-lg transition-transform duration-300 ease-out"
          style={{
            width: `${DRAWER_WIDTH}px`,
            transform: isDrawerOpen
              ? `translateX(${drawerSwipeOffset}px)`
              : `translateX(${
                  drawerSwipeOffset > 0
                    ? DRAWER_WIDTH - drawerSwipeOffset
                    : DRAWER_WIDTH
                }px)`,
          }}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="font-nunito text-lg font-semibold text-white">
                  Settings
                </h2>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    cancelUpload();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-white"
                  aria-label="Close settings drawer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
              }}
            >
              <div className="space-y-6">
                <div
                  className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                  }}
                >
                  <h3 className="font-nunito text-white font-medium mb-3 text-center">
                    Upload New Wallpaper
                  </h3>

                  {!showNameInput ? (
                    <>
                      <p className="text-white/80 mb-6 text-center">
                        Add your own images to customize your collection.
                      </p>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        aria-label="Upload image files"
                      />

                      <button
                        onClick={handleUploadClick}
                        className="font-nunito w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        aria-label="Select images to upload"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload from Camera Roll
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-white/80 mb-2 text-center">
                        {totalFiles > 1
                          ? `Uploading image ${
                              currentUploadIndex + 1
                            } of ${totalFiles}`
                          : "Enter a name for your wallpaper (max 16 characters)"}
                      </p>

                      {totalFiles > 1 && (
                        <div className="w-full bg-purple-900/30 rounded-full h-2 mb-4">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}

                      <div className="mb-4">
                        {selectedFiles[currentUploadIndex] && (
                          <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                            <img
                              src={URL.createObjectURL(
                                selectedFiles[currentUploadIndex]
                              )}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                        <input
                          type="text"
                          value={wallpaperName}
                          onChange={handleNameChange}
                          maxLength={16}
                          placeholder="Wallpaper name"
                          className="font-nunito w-full px-4 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white bg-purple-900/40 placeholder:text-white/60"
                          aria-label="Wallpaper name"
                          aria-required="true"
                          aria-invalid={!!nameError}
                          aria-describedby={
                            nameError ? "name-error" : undefined
                          }
                        />
                        {nameError && (
                          <p
                            id="name-error"
                            className="font-nunito text-red-300 text-xs mt-1"
                          >
                            {nameError}
                          </p>
                        )}
                        <p className="font-nunito text-xs text-white/60 mt-1 text-right">
                          {wallpaperName.length}/16
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={cancelUpload}
                          className="font-nunito flex-1 py-2 px-4 border border-white/50 text-white rounded-md font-medium hover:bg-white/10 transition-colors"
                          aria-label="Cancel upload"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleNameSubmit}
                          className="font-nunito flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
                          aria-label={
                            totalFiles > 1 ? "Next" : "Save wallpaper"
                          }
                        >
                          {totalFiles > 1 && currentUploadIndex < totalFiles - 1
                            ? "Next"
                            : "Save"}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div
                  className="p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                  }}
                >
                  <p className="font-nunito text-sm text-white">
                    <span className="font-medium">Total wallpapers:</span>{" "}
                    {isHydrated ? wallpapers.length : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <p className="font-nunito text-xs text-center text-white/60">
                Swipe right to close
              </p>
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && isHydrated && (
        <div
          className="fullscreen-modal"
          onClick={() => setIsFullscreen(false)}
          ref={fullscreenRef}
        >
          <div
            className="fullscreen-close"
            onClick={() => setIsFullscreen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close fullscreen view"
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsFullscreen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>

          <div
            className="fullscreen-image-container"
            onTouchStart={handleFullscreenTouchStart}
            onTouchMove={handleFullscreenTouchMove}
            onTouchEnd={handleFullscreenTouchEnd}
          >
            {/* Previous image (for transition) */}
            {(fullscreenSwipeOffset > 0 ||
              fullscreenSwipeDirection === "prev") &&
              wallpapers[currentIndex] && (
                <img
                  src={
                    wallpapers[
                      currentIndex === 0
                        ? wallpapers.length - 1
                        : currentIndex - 1
                    ].url
                  }
                  alt={
                    wallpapers[
                      currentIndex === 0
                        ? wallpapers.length - 1
                        : currentIndex - 1
                    ].alt
                  }
                  className="fullscreen-image-prev"
                  style={{
                    transform:
                      fullscreenSwipeDirection === "prev"
                        ? "translateX(100%)"
                        : `translateX(${Math.min(
                            100,
                            fullscreenSwipeOffset / 5
                          )}%)`,
                    transition: fullscreenSwipeDirection
                      ? "transform 0.3s ease-out"
                      : "none",
                  }}
                  draggable={false}
                />
              )}

            {/* Current image */}
            {wallpapers[currentIndex] && (
              <img
                src={wallpapers[currentIndex].url}
                alt={wallpapers[currentIndex].alt}
                className="fullscreen-image"
                style={{
                  transform: `translateX(${fullscreenSwipeOffset}px)`,
                  transition: fullscreenTransitioning
                    ? "transform 0.3s ease-out"
                    : "none",
                  animation:
                    fullscreenSwipeDirection === "next"
                      ? "slideOutToLeft 0.3s forwards"
                      : fullscreenSwipeDirection === "prev"
                      ? "slideOutToRight 0.3s forwards"
                      : "none",
                }}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            )}

            {/* Next image (for transition) */}
            {(fullscreenSwipeOffset < 0 ||
              fullscreenSwipeDirection === "next") &&
              wallpapers[currentIndex] && (
                <img
                  src={
                    wallpapers[
                      currentIndex === wallpapers.length - 1
                        ? 0
                        : currentIndex + 1
                    ].url
                  }
                  alt={
                    wallpapers[
                      currentIndex === wallpapers.length - 1
                        ? 0
                        : currentIndex + 1
                    ].alt
                  }
                  className="fullscreen-image-next"
                  style={{
                    transform:
                      fullscreenSwipeDirection === "next"
                        ? "translateX(0)"
                        : `translateX(${Math.max(
                            -100,
                            fullscreenSwipeOffset / 5
                          )}%)`,
                    transition: fullscreenSwipeDirection
                      ? "transform 0.3s ease-out"
                      : "none",
                  }}
                  draggable={false}
                />
              )}
          </div>

          <div
            className="fullscreen-nav fullscreen-nav-prev hidden md:flex"
            onClick={(e) => {
              e.stopPropagation();
              navigateFullscreenImage("prev");
            }}
            role="button"
            tabIndex={0}
            aria-label="Previous wallpaper"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </div>

          <div
            className="fullscreen-nav fullscreen-nav-next hidden md:flex"
            onClick={(e) => {
              e.stopPropagation();
              navigateFullscreenImage("next");
            }}
            role="button"
            tabIndex={0}
            aria-label="Next wallpaper"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
