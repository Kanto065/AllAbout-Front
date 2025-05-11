import { useEffect, useState, useRef, useCallback } from "react";
import Product from "../../Components/Cards/Product";
import useAxiosPublic from "../../Hooks/useAxiosPublic";

export default function Products() {
  const axiosPublic = useAxiosPublic();
  const [typ, setTyp] = useState("All");
  const [showProducts, setShowProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // State to track if more products are available
  const observer = useRef();

  const lastProductRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      try {
        const res = await axiosPublic.get(
          `/products?page=${page}&limit=10&type=${typ}`
        );
        if (res?.data.length < 10) {
          setHasMore(false); // No more products to load
        }
        setShowProducts((prevProducts) => [...prevProducts, ...res?.data]);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (hasMore) {
      fetchProducts();
    }
  }, [axiosPublic, typ, page, hasMore]);

  useEffect(() => {
    // Reset products and pagination state when type changes
    setShowProducts([]);
    setPage(1);
    setHasMore(true);
  }, [typ]);

  return (
    <div className="max-w-[1400px] mx-auto py-16 px-2">
      <h1 className="text-4xl md:text-5xl text-center font-bold mb-8 dm-sans bg-clip-text text-transparent bg-gradient-to-r from-[#d26bc3] to-[#94a1f8] drop-shadow-2xl playfair">
        Only For You
      </h1>

      <ul className="w-full my-10 px-x overflow-auto flex justify-center space-x-2 text-black playfair">
        <li
          onClick={() => setTyp("All")}
          className={`px-5 py-2 bg-[#C4ACC2] rounded-lg hover:bg-[#c88fc2] transition`}
        >
          All
        </li>
        <li
          onClick={() => setTyp("Flash Sale")}
          className={`px-5 py-2 bg-[#c5eac5] rounded-lg hover:bg-[#a3e7a3] transition`}
        >
          Flash Sale
        </li>
        <li
          onClick={() => setTyp("New arrivals")}
          className={`px-5 py-2 bg-[#B1B4DD] rounded-lg hover:bg-[#969bd6] transition`}
        >
          New arrivals
        </li>
      </ul>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {showProducts?.map((product, index) => {
          if (showProducts.length === index + 1) {
            return (
              <div ref={lastProductRef} key={product?._id}>
                <Product product={product} />
              </div>
            );
          } else {
            return <Product key={product?._id} product={product} />;
          }
        })}
        {loading && (
          <div className="min-h-[50vh] animate-pulse w-full bg-slate-100"></div>
        )}
      </div>
    </div>
  );
}
