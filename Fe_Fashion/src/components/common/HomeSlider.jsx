import { useEffect, useState } from "react";
const slides = [
  { id: 1, image: 'banner1.jpg', title: "New Collection" },
  { id: 2, image: "banner2.jpg", title: "Men Wear 2025" },
  { id: 3, image: "banner3.jpg", title: "Women Trend" },
];

export default function HomeSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative ml-20 mr-20 h-[450px] overflow-hidden mt-5 z-0">
      <div
        className="flex h-full transition-transform duration-700 "
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div class="mt-50  max-lg:ml-10 max-md:ml-6 text-black max-w-lg">
            <button class="mt-8 px-8 py-3 bg-white text-black font-medium
                        hover:bg- hover:text-black cursor-pointer transition ">
            Shop Now
            </button>

        </div>
        </div>
        <button className="absolute left-6 top-1/2 -translate-y-1/2
                    bg-white/70 p-3 rounded-full
                    hover:bg-white transition">
        ‹
        </button>

        <button className="absolute right-6 top-1/2 -translate-y-1/2
                    bg-white/70 p-3 rounded-full
                    hover:bg-white transition">
        ›
        </button>
        <div className="absolute bottom-6 w-full flex justify-center gap-3">
            <span class="w-3 h-3 rounded-full bg-white"></span>
            <span class="w-3 h-3 rounded-full bg-white/50"></span>
            <span class="w-3 h-3 rounded-full bg-white/50"></span>
        </div>


    </section>
  );
}
