export default function SearchView({isSearching}){
        return(
        <div className={`transition-all duration-500 ease-in-out transform ${
          isSearching
            ? "opacity-100 translate-y-0 h-100 bg-white mr-20 ml-20"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}>
            <header className="flex ml-20 gap-x-5 transition-all ease-in-out transform
            h-auto font-bold text-base font-serif border-b-1 mr-20">
                <a href="">Men</a>
                <a href="">Women</a>
                 <a href="">Kid</a>
            </header>
        </div>
        )
    }
