import FilterButton from "../common/filter"
export default function ProductList(){
    return(
        <div className="pl-20 pr-20 mt-3 flex flex-col  ">
            <FilterButton className=" w-5 h-5 cursor-pointer"></FilterButton>
            <section>
                danh sách sản phẩm sẽ được lấy từ db và display ở đây tùy thuộc vào mình chọn mục main/women/kid
                và trong từng mục này lại có bags, jewelry, watches,...
            </section>
        </div>
    )

}