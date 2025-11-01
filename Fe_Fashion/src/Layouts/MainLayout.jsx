
export default function MainLayout(){
    return(
        <main className="flex flex-col">
            <nav className="flex justify-between items-center align-middle h-18 font-bold text-lg font-serif ">
                <div className="flex ml-10 gap-x-5">
                    <a href="">Men</a>
                    <a href="">Women</a>
                    <a href="">Kid</a>
                 </div>
                <div className="">
                        Logo
                </div>
                <div className="mr-10 flex gap-x-5">
                    <a href="">Cart</a>
                    <a href="">Favourite</a>
                    <a href="">Profile</a>
                </div>
            </nav>
            <nav className="flex justify-between shadow-sm font-serif">
                <div className=" ml-10 gap-x-5 " >
                    <ul className="flex gap-x-5 h-10 items-center ">
                        <li><a href="">Clothing</a></li>
                        <li><a href="">Shoes</a></li>
                        <li><a href="">Bags</a></li>
                        <li><a href="">Watches</a></li>
                        <li><a href="">Jewelry</a></li>
                        <li><a href="">Brands</a></li>
                    </ul>
                </div>
                <div className="mr-10">
                    <input type="search" placeholder="What are you looking for?" 
                    className="w-60 focus:outline-none border-b-1 pl-5" />
                </div>
            </nav>
           
        </main>
    )
}