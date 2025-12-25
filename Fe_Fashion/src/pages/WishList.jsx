{/* <nav className="flex  shadow-sm font-serif">
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
            <ProductList/> */}