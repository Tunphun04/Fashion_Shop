import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
export default function Filter({className}){
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const BRANDS = ['LV']
  const location = useLocation();

 

  

  function SizeFilter({ onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const ref = useRef(null);

  // đóng khi click ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleSize(size) {
    setSelected((prev) => {
      const next = prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size];

      onChange?.(next);
      return next;
    });
  }

  return (
    <div ref={ref} className="relative w-20">
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-row w-15 items-center justify-between align-middle
        py-3 font-medium"
      >
        <span>
          Size
          {selected.length > 0 && (
            <span className="flex flex-col ml-2 text-sm text-gray-500">
              ({selected.join(", ")})
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute mt-3 grid grid-cols-2 gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`border px-3 py-2 text-sm transition
              ${
                selected.includes(size)
                  ? "bg-black text-white border-black"
                  : "hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



  function BrandFilter({ onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const ref = useRef(null);

  // đóng khi click ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleSize(size) {
    setSelected((prev) => {
      const next = prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size];

      onChange?.(next);
      return next;
    });
  }

  return (
    <div ref={ref} className="relative w-20">
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-row w-15 items-center justify-between
         py-3 font-medium"
      >
        <span>
          Brand
          {selected.length > 0 && (
            <span className="flex flex-col ml-2 text-sm text-gray-500">
              ({selected.join(", ")})
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute mt-3 grid grid-cols-2 gap-2">
          {BRANDS.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`border px-3 py-2 text-sm transition
              ${
                selected.includes(size)
                  ? "bg-black text-white border-black"
                  : "hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceRangeFilter({
  min = 0,
  max = 10000000,
  step = 1000,
  onChange,
}) {
  const [range, setRange] = useState([min, max]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // CLICK OUTSIDE → CLOSE
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMinChange(e) {
    const value = Math.min(Number(e.target.value), range[1] - step);
    const next = [value, range[1]];
    setRange(next);
    onChange?.(next);
  }

  function handleMaxChange(e) {
    const value = Math.max(Number(e.target.value), range[0] + step);
    const next = [range[0], value];
    setRange(next);
    onChange?.(next);
  }
    const isAll = range[0] === min && range[1] === max;

  return (
    <div ref={wrapperRef} className="relative w-50">
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className={ `flex w-full py-3 font-medium text-left ${!isAll ? 'flex flex-col w-full py-3 font-medium text-left' : 'flex w-full py-3 font-medium text-left'}`}
      >
        <span>Price</span>
        <span className={`${isAll ? 'text-sm text-gray-500 ml-2' : 'text-sm text-gray-500' }`}>
          {isAll
            ? "(All)"
            : ` (${range[0].toLocaleString()}₫ – ${range[1].toLocaleString()}₫)`}
        </span>
      </button>

      {/* DROPDOWN (ABSOLUTE) */}
      <div
        className={`absolute left-0 top-full z-50 w-full bg-white shadow-md
        transition-all duration-300 ease-in-out
        ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-4">
          <div className="relative">
            {/* Track */}
            <div className="h-1 bg-gray-200 rounded"></div>

            {/* Range */}
            <div
              className="absolute h-1 bg-black rounded top-0"
              style={{
                left: `${((range[0] - min) / (max - min)) * 100}%`,
                right: `${100 - ((range[1] - min) / (max - min)) * 100}%`,
              }}
            />

            {/* MIN */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={range[0]}
              onChange={handleMinChange}
              className="absolute w-full top-0 pointer-events-none
              appearance-none bg-transparent
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black"
            />

            {/* MAX */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={range[1]}
              onChange={handleMaxChange}
              className="absolute w-full top-0 pointer-events-none
              appearance-none bg-transparent
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
   return (
  <div className="flex flex-row align-middle">
    <span className="mr-5 mt-2.5">
      Filter by:
    </span>

  

    <SizeFilter
      onChange={(sizes) => {
        console.log("Selected sizes:", sizes);
      }}
    />

    <BrandFilter
      onChange={(brands) => {
        console.log("Selected brand:", brands);
      }}
    />

    <PriceRangeFilter
      min={0}
      max={10000000}
      step={1000}
      onChange={(range) => {
        console.log("Select price range:", range);
      }}
    />
  </div>
);
}