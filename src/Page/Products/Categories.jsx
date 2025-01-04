import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import useCategories from "../../Hooks/useCategories";
// import useSubCategories from "../../Hooks/useSubCategories";
import useMainCategories from "../../Hooks/useMainCategories";
import { useEffect, useState } from "react";

export default function Categories({ quaries }) {
  const [categories] = useCategories();
  // const [subCategories] = useSubCategories();
  const [mainCategories] = useMainCategories();
  const { presentMainCategory, presentCategory, presentSubCategory, setIsPresentCategory } = quaries;
  const [showCategories, setShowCategories] = useState([]);
  const [isPresent, setIsPresent] = useState({});

  useEffect(() => {
    // if (presentSubCategory) {
    //   setShowCategories(subCategories);
    //   setIsPresent(
    //     subCategories?.find((item) => item?._id === presentSubCategory)
    //   );
    // } else 
    if (presentCategory) {
      setIsPresent(
        categories?.find((item) => item?._id === presentCategory)
      );
    } else if (presentMainCategory) {
      setIsPresent(
        mainCategories?.find((item) => item?._id === presentMainCategory)
      );
      setShowCategories(categories?.filter(item => item?.mainCategory === isPresent?.name));

    }
  }, [
    categories,
    // subCategories,
    mainCategories,
    presentCategory,
    presentMainCategory,
    presentSubCategory,
    isPresent
  ]);

  useEffect(()=>{
    setIsPresentCategory(isPresent?.name)
  },[setIsPresentCategory, isPresent])
  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
      {showCategories?.map((category, idx) => {
        let linkPath = "/products";

        // Determine the correct link based on the available query
        if (presentCategory) {
          linkPath = `/products?category=${category?._id}`;
        } else if (presentMainCategory) {
          linkPath = `/products?category=${category?._id}`;
        } else {
          linkPath = `/products?maincategory=${category?._id}`;
        }

        return (
          <Link to={linkPath} key={idx} className="w-full">
            <div
              className={`${
                isPresent?._id === category?._id
                  ? "bg-[#C4ACC2] text-white"
                  : "bg-white"
              } p-1 rounded`}
            >
              <img
                className="h-16 md:h-20 w-16 md:w-20 rounded-full mx-auto shadow"
                src={category?.image}
                alt={category?.name}
              />
              <h3 className="text-center text-[10px] md:text-sm font-semibold mt-2 line-clamp-2">
                {category?.name}
              </h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
