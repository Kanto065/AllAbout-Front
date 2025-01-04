import { useEffect, useState } from "react";
import Product from "../../Components/Cards/Product";
import useAllProducts from "../../Hooks/useAllProducts";
import useAxiosPublic from "../../Hooks/useAxiosPublic";

export default function Products() {
  const [allProducts] = useAllProducts();
  const axiosPublic = useAxiosPublic();
  const [typ, setTyp] = useState("All");
  const [typProducts, setTypProducts] = useState([]);
  const [showProducts, setShowProducts] = useState([]);

  useEffect(() => {
    axiosPublic
      .get(`/topsells/${typ}`)
      .then((res) => setTypProducts(res?.data));
  }, [axiosPublic, typ]);

  useEffect(() => {
    if (typ === "All") {
      setShowProducts(allProducts);
    } else {
      setShowProducts(typProducts);
    }
  }, [allProducts, typ, typProducts]);

  return (
    <div className="max-w-[1400px] mx-auto py-16 px-2">
      <h1 className="text-4xl md:text-5xl text-center font-bold mb-8 dm-sans bg-clip-text text-transparent bg-gradient-to-r from-[#d26bc3] to-[#94a1f8] drop-shadow-2xl playfair">
        Only For You
      </h1>

      <ul className="w-full my-10 px-x overflow-auto flex justify-center space-x-2 text-black playfair">
        <li
          onClick={() => {
            setTyp("All");
            setShowProducts([]);
          }}
          className={`px-5 py-2 bg-[#C4ACC2] rounded-lg hover:bg-[#c88fc2] transition`}
        >
          All
        </li>
        <li
          onClick={() => {
            setTyp("Flash Sale");
            setShowProducts([]);
          }}
          className={`px-5 py-2 bg-[#c5eac5] rounded-lg hover:bg-[#a3e7a3] transition`}
        >
          Flash Sale
        </li>
        <li
          onClick={() => {
            setTyp("New arrivals");
            setShowProducts([]);
          }}
          className={`px-5 py-2 bg-[#B1B4DD] rounded-lg hover:bg-[#969bd6] transition`}
        >
          New arrivals
        </li>
      </ul>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {showProducts?.map((product) => (
          <Product key={product?._id} product={product} />
        ))}
        {showProducts?.length < 1 && (
          <div className="min-h-[50vh] animate-pulse w-full bg-slate-100"></div>
        )}
      </div>
    </div>
  );
}
