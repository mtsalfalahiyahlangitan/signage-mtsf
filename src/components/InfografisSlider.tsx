// src/components/InfografisSlider.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Infografis } from "@/types";

interface Props {
  items: Infografis[];
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/p\/|instagram\.com\/reel\//.test(url);
}

function getInstagramEmbedUrl(url: string): string {
  const match = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
  if (!match) return "";
  return `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/`;
}

// Ukuran native iframe Instagram
const IG_W = 328;
const IG_H = 560;

export default function InfografisSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const currentRef = useRef(0);
  const transitioningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pantau ukuran container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scale agar iframe Instagram muat di container
  const igScale = containerSize.w > 0 && containerSize.h > 0
    ? Math.min(containerSize.w / IG_W, containerSize.h / IG_H)
    : 1;

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const goTo = useCallback(async (nextIdx: number) => {
    if (transitioningRef.current) return;
    const nextItem = items[nextIdx];
    if (nextItem?.url_gambar && !isInstagramUrl(nextItem.url_gambar)) {
      await preloadImage(nextItem.url_gambar);
    }
    transitioningRef.current = true;
    setTransitioning(true);
    timerRef.current = setTimeout(() => {
      currentRef.current = nextIdx;
      setCurrent(nextIdx);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          transitioningRef.current = false;
          setTransitioning(false);
        });
      });
    }, 500);
  }, [items]);

  const scheduleNext = useCallback(() => {
    clearTimer();
    if (items.length <= 1) return;
    const durasi = (items[currentRef.current]?.durasi_detik || 10) * 1000;
    timerRef.current = setTimeout(() => {
      const nextIdx = (currentRef.current + 1) % items.length;
      goTo(nextIdx);
    }, durasi);
  }, [items, goTo]);

  useEffect(() => {
    scheduleNext();
    return clearTimer;
  }, [current, scheduleNext]);

  if (items.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl">
        <ImageIcon size={40} className="text-stone-300 mb-3" />
        <p className="text-stone-400 text-sm font-medium">Belum ada infografis aktif</p>
        <p className="text-stone-300 text-xs mt-1">Tambahkan data di tab Infografis</p>
      </div>
    );
  }

  const item = items[current];
  const isIG = isInstagramUrl(item?.url_gambar || "");
  const embedUrl = isIG ? getInstagramEmbedUrl(item.url_gambar) : "";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl border border-stone-200 bg-black"
    >
      {isIG ? (
        <div
          key={`ig-${current}`}
          className="absolute inset-0 flex items-center justify-center bg-[#fafafa]"
          style={{
            opacity: transitioning ? 0 : 1,
            transition: "opacity 500ms ease-in-out",
          }}
        >
          <div
            style={{
              width: IG_W,
              height: IG_H,
              transform: `scale(${igScale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}
          >
            <iframe
              src={embedUrl}
              width={IG_W}
              height={IG_H}
              style={{ border: "none", borderRadius: 12, display: "block" }}
              scrolling="no"
              allow="encrypted-media"
            />
          </div>
        </div>
      ) : (
        <>
          {item?.url_gambar && (
            <img
              key={`bg-${current}`}
              src={item.url_gambar}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-110"
              style={{
                filter: "blur(24px) brightness(0.7) saturate(1.4)",
                opacity: transitioning ? 0 : 1,
                transition: "opacity 500ms ease-in-out",
              }}
            />
          )}

          {item?.url_gambar && (
            <div
              key={`main-${current}`}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: transitioning ? 0 : 1,
                transition: "opacity 500ms ease-in-out",
              }}
            >
              <img
                src={item.url_gambar}
                alt={item.judul}
                className="max-w-full max-h-full object-contain relative z-10"
              />
            </div>
          )}

          {item?.judul && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4 pointer-events-none"
              style={{
                opacity: transitioning ? 0 : 1,
                transition: "opacity 500ms ease-in-out",
                zIndex: 20,
              }}
            >
              <p className="text-white text-sm font-medium drop-shadow">{item.judul}</p>
            </div>
          )}
        </>
      )}

      {items.length > 1 && (
        <div className="absolute top-3 right-3 z-30">
          <span className="bg-black/40 text-white/80 text-[10px] font-mono px-2 py-0.5 rounded-full">
            {current + 1}/{items.length}
          </span>
        </div>
      )}

      {items.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-30">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx === current || transitioningRef.current) return;
                clearTimer();
                goTo(idx);
              }}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}