import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useTopSells from "../../Hooks/useTopSells";
import { TiDelete } from "react-icons/ti";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import useAxiosPublic from "../../Hooks/useAxiosPublic";

export default function TopSell() {
  const axiosPublic = useAxiosPublic();
  const [showProducts, setShowProducts] = useState([]);

  useEffect(()=>{
    axiosPublic.get(`/topsells/Featured`).then(res => setShowProducts(res?.data));
  },[axiosPublic])

  return (
    <div className="pb-16">
      <h1 className="text-4xl md:text-5xl text-center font-bold mb-3 playfair">
        Featured Items
      </h1>
            <div className="flex justify-center items-center mb-8">
            <p className="h-1 w-1/4 bg-[#C4ACC2]"></p>
            <p className="h-1 w-1/4 bg-[#c5eac5]"></p>
            </div>
      <div className="px-2">
        <Swiper
          slidesPerView={4}
          spaceBetween={10}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 2000, // Time between transitions (in milliseconds)
            disableOnInteraction: false, // Continue autoplay even after user interaction
          }}
          modules={[Pagination, Autoplay]}
          className="mySwiper"
          breakpoints={{
            // when window width is >= 800px
            800: {
              slidesPerView: 3, // 3 items on larger screens (like tablets and desktops)
            },
            // when window width is >= 640px
            640: {
              slidesPerView: 2, // 2 items on larger screens (like tablets and desktops)
            },
            // when window width is < 640px
            0: {
              slidesPerView: 1, // 2 items on phone screens
            },
          }}
        >
          {showProducts?.map((product, idx) => (
            <SwiperSlide key={product?._id}>
              <div key={idx} className="space-y-2 rounded-xl bg-white">
                <div className="relative h-80 w-full flex justify-center items-center cont overflow-hidden">
                  <img
                    className={`mx-auto h-full hover:scale-125 scale-100 transition-transform duration-1000`}
                    src={product?.images[0]}
                    alt={product?.name}
                  />
                </div>
                <div className="p-3">
                  <h2 className="text-xl text-[#303049] font-semibold raleway">
                    {product?.name}
                  </h2>
                  <Link to={`/products/${product?.name}`}>
                    <button className="w-full bg-[#C4ACC2] text-white py-2 rounded mt-2">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

{
  /* <div className="slider-container mx-4">
            <Slider {...settings}>
                {
                    categories?.map((category, idx) =>
                        <Link to={`/products?category=${category?.name}`}
                            key={idx}
                            className="w-full"
                        >
                            <div className={`w-11/12 rounded p-5 ${presentCategory == category?.name ? "bg-[#C4ACC2] text-white" : "bg-white"}`}>
                                <img className="max-h-10 md:max-h-16 mx-auto" src={category?.image} alt={category?.name} />
                                <h3 className="text-center text-[10px] md:text-[15px] line-clamp-1">{category?.name}</h3>
                            </div>
                        </Link>
                    )
                }
            </Slider> */
}
