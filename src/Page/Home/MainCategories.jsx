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

            {/* Horizontal scrolling container */}
            <div className="flex overflow-x-auto gap-4 py-2">
                {mainCategories?.map((mCategory) => (
                    <Link
                        to={`/products?maincategory=${mCategory?._id}`}
                        className="shadow p-0.5 rounded-md flex-shrink-0 w-32"  // Reduced item width
                        key={mCategory?._id}
                    >
                        <img
                            className="h-12 md:h-16 w-12 md:w-16 rounded-full mx-auto" // Adjusted image size
                            src={mCategory?.image}
                            alt=""
                        />
                        <h2 className="text-center text-[10px] md:text-sm font-bold mt-1 line-clamp-1">
                            {mCategory?.name}
                        </h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}
