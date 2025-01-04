import { useState } from "react";
import Categories from "./Categories";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import ShowProducts from "../../Components/Section/ShowProducts";
import useAllProducts from "../../Hooks/useAllProducts";

export default function Products() {
  const [allProducts] = useAllProducts();
  const [sortProducts, setSortProducts] = useState([]);
  const [presentMainCategory, setPresentMainCategory] = useState("");
  const [presentCategory, setPresentCategory] = useState("");
  const [presentSubCategory, setPresentSubCategory] = useState("");
  const [isPresentCategory, setIsPresentCategory] = useState("");

  // Function to get the query parameters from the URL
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  // Retrieve the 'category' parameter from the query string
  const query = useQuery();
  const mainCategoryParam = query.get("maincategory");
  const categoryParam = query.get("category");
  const subCategoryParam = query.get("subcategory");

  useEffect(() => {
    setPresentMainCategory(mainCategoryParam); // Set the category from the URL
    setPresentCategory(categoryParam); // Set the category from the URL
    setPresentSubCategory(subCategoryParam); // Set the category from the URL
  }, [mainCategoryParam, categoryParam, subCategoryParam]);
console.log(isPresentCategory)
  useEffect(() => {
    if (presentCategory || presentMainCategory || presentSubCategory) {
      let filterProducts = allProducts?.filter(
        (product) =>
          product?.category == isPresentCategory ||
          product?.mainCategory == isPresentCategory ||
          product?.subCategory == isPresentCategory
      );
      setSortProducts(filterProducts);
    } else {
      setSortProducts(allProducts);
    }
  }, [allProducts, presentCategory, presentMainCategory, presentSubCategory,isPresentCategory]);

  return (
    <div className="max-w-[95%] 2xl:max-w-7xl mx-auto pt-36 md:pt-48 min-h-screen">
      <div>
        <Categories quaries={{ presentMainCategory, presentCategory, presentSubCategory, setIsPresentCategory }} />
      </div>
      <div className="my-10">
        <h3
          className={`text-xl md:text-2xl text-[#303049] font-semibold pl-1 border-l-4 border-[#C4ACC2] mb-2 ${
            presentCategory || ""
          }`}
        >
          Search By `{isPresentCategory}`
        </h3>
        <ShowProducts products={sortProducts || []} />
        {sortProducts?.length === 0 && (
          <div className="flex items-center justify-center">
            <img
              className="h-64 w-64 rounded-full"
              src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif"
              alt="no data found"
            />
          </div>
        )}
      </div>
    </div>
  );
}
