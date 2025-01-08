import { Link } from "react-router-dom";
import useMainCategories from "../../Hooks/useMainCategories";

export default function MainCategories() {
    const [mainCategories] = useMainCategories([]);

    return (
        <div className="pb-16 pt-8 lg:py-16 px-3">
            <h1 className="text-4xl md:text-5xl text-center font-bold mb-3 playfair">Categories</h1>
            <div className="flex justify-center items-center mb-8">
            <p className="h-1 w-1/4 bg-[#C4ACC2]"></p>
            <p className="h-1 w-1/4 bg-[#c5eac5]"></p>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-5">
                {
                    mainCategories?.map(mCategory =>
                        <Link
                        to={`/products?maincategory=${mCategory?._id}`}
                        className="shadow p-0.5 rounded-md"
                         key={mCategory?._id}>
                            <img className="h-16 md:h-20 w-16 md:w-20 rounded-full mx-auto" src={mCategory?.image} alt="" />
                            <h2 className="text-center text-[10px] md:text-base font-bold mt-1 line-clamp-1">{mCategory?.name}</h2>
                        </Link>
                    )
                }
            </div>
        </div>
    )
}
