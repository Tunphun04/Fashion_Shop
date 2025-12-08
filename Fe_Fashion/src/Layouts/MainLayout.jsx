import SearchView from "../components/search/searchView";
import { useState, useRef, useEffect } from "react"
import {UserCircle, Heart, ShoppingCart} from 'lucide-react';
import ProductList from '../components/products/productList'
export default function MainLayout(){
    const [isSearching, setIsSearching] = useState(false);
    const containerRef = useRef(null); // chứa input + search view

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
                    <a href="">Men</a>
                    <a href="">Women</a>
                    <a href="">Kid</a>
                 </div>
                <div className="text-4xl">
                        P.Style
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
            <nav className="flex  shadow-sm font-serif">
                 <div className={`${isSearching ?"ml-0 flex-1" :"ml-20 gap-x-5 flex min-w-[300px] flex-1 "} `}>
                    <div className={`${isSearching ? "hidden" : "block"}`}>
                        <ul className="flex gap-x-5 h-10 items-center text-sm">
                        <li><a href="">Clothing</a></li>
                        <li><a href="">Shoes</a></li>
                        <li><a href="">Bags</a></li>
                        <li><a href="">Watches</a></li>
                        <li><a href="">Jewelry</a></li>
                        <li><a href="">Brands</a></li>
                        </ul>
                    </div>
                    <div className={`w-full ${isSearching ? "block" : "hidden"}`}>
                        <SearchView isSearching={isSearching} />
                    </div>

                 </div>
                <div className={`mr-20 flex items-center ${isSearching ? "mr-20 flex items-start" : "mr-20 flex items-center"} `}ref={containerRef}>
                    <input id='search' type="search" placeholder="What are you looking for?" 
                    className={` focus:outline-none border-b-1 pl-5 mb-1
                    max-h-40 focus:border-b-1 ${isSearching ? "w-100 transition-all ease-in-out transform" :"w-60"}
                    `}
                    onFocus={() => setIsSearching(true)}
                    />
                </div>
                
                
            </nav>
            <ProductList/>
           
        </main>
    )
}