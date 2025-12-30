import SearchView from "../components/search/searchView";
import Footer from "../components/common/footer";
import { useState, useRef, useEffect } from "react"
import {UserCircle, Heart, ShoppingCart} from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import DisplayProducts from "../components/products/DisplayProducts";
import Home from "../pages/Home";
import MenWear from "../pages/products/MenWear";
import WomenWear from "../pages/products/WomenWear";
import KidWear from "../pages/products/KidWear";

export default function MainLayout(){
    const [isSearching, setIsSearching] = useState(false);
    const containerRef = useRef(null); // chứa input + search view
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + "/");
        };
    const currentMainCategory =
    location.pathname.startsWith("/men") ? "men" :
    location.pathname.startsWith("/women") ? "women" :
    location.pathname.startsWith("/kid") ? "kid" :
    null;
 // Click outside để đóng search view

    useEffect(() => {
        function handleDocClick(e) {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target)) {
            setIsSearching(false);
        }
        }

        function handleEsc(e) {
        if (e.key === "Escape") setIsSearching(false);
        }

        document.addEventListener("mousedown", handleDocClick);
        document.addEventListener("keydown", handleEsc);
        return () => {
        document.removeEventListener("mousedown", handleDocClick);
        document.removeEventListener("keydown", handleEsc);
        };
    }, []);
    
    return(
        <main className="flex flex-col">
            <nav className={`flex justify-between items-center h-18 font-bold text-base font-serif transition-all duration-500
                `}>
                <div className={`flex ml-20 gap-x-5 transition-all duration-500 ease-in-out transform ${
                    isSearching
                        ? "opacity-0 -translate-y-5 pointer-events-none"
                        : "opacity-100 translate-y-0"
                    }`}>
                    <Link
                        to="/men"
                        className={`pb-1 border-b-2 transition-all
                            ${isActive("/men") ? "border-black" : "border-transparent hover:border-gray-400"}
                        `}
                        >
                        Men
                    </Link>

                    <Link
                        to="/women"
                        className={`pb-1 border-b-2 transition-all
                            ${isActive("/women") ? "border-black" : "border-transparent hover:border-gray-400"}
                        `}
                        >
                        Women
                    </Link>

                    <Link
                        to="/kid"
                        className={`pb-1 border-b-2 transition-all
                            ${isActive("/kid") ? "border-black" : "border-transparent hover:border-gray-400"}
                        `}
                        >
                        Kid
                    </Link>
                 </div>
                <div className="text-4xl">
                        <a href="/">Style</a>
                </div>
                <div className={`mr-25 flex gap-x-5 
                    transition-all duration-500 ease-in-out transform ${
                    isSearching
                        ? "opacity-0 -translate-y-5 pointer-events-none"
                        : "opacity-100 translate-y-0"
                    }`}>
                    <a href=""><ShoppingCart></ShoppingCart></a>
                    <a href=""><Heart></Heart></a>
                    <a href=""><UserCircle className=""></UserCircle></a>
                </div>
            </nav>
            <nav className="relative flex  shadow-sm font-serif">
                 <div className={`${isSearching ?"ml-0 flex-1" :"ml-20 gap-x-5 flex min-w-[300px] flex-1 "} `}>
                    <div className={`${isSearching ? "hidden" : "block"}`}>
                        <ul className="flex gap-x-5 h-10 items-center text-sm">
                            {["clothing", "shoes", "bags", "watches", "jewelry", "brands"].map(item => {
                                const path = `/${currentMainCategory}/${item}`;
                                return (
                                <li key={item}>
                                    <Link
                                    to={path}
                                    className={`pb-1 border-b-2 capitalize transition-all
                                        ${isActive(path)
                                        ? "border-black"
                                        : "border-transparent hover:border-gray-400"}
                                    `}
                                    >
                                    {item}
                                    </Link>
                                </li>
                                );
                            })}
                    </ul>
                    </div>
                    <div className={`w-full ${isSearching ? "block absolute z-10" : "hidden"}`}>
                        <SearchView isSearching={isSearching} />
                    </div>

                 </div>
                <div className={`mr-20 flex items-center ${isSearching ? "mr-20 flex items-start z-100" : "mr-20 flex items-center"} `}ref={containerRef}>
                    <input id='search' type="search" placeholder="What are you looking for?" 
                    className={` focus:outline-none border-b-1 pl-5 mb-1
                    max-h-40 focus:border-b-1 ${isSearching ? "w-100 transition-all ease-in-out transform" :"w-60"}
                    `}
                    onFocus={() => setIsSearching(true)}
                    />
                </div>
                
                
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/men" element={<MenWear />} />
                <Route path="/women" element={<WomenWear />} />
                <Route path="/kid" element={<KidWear />} />
            </Routes>
            <DisplayProducts/>
            <Footer></Footer>
        </main>
        
    )
}