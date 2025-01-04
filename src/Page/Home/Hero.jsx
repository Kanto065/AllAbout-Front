import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import useBanners from "../../Hooks/useAllBanners";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../Hooks/useAxiosPublic";

export default function Hero() {
  const axiosPublic = useAxiosPublic();
  const [banners] = useBanners();
  const [presentOffer, setPresentOffer] = useState([]);

  useEffect(() => {
    axiosPublic.get(`/offertag`).then((data) => {
      setPresentOffer(data?.data);
    });
  }, [axiosPublic]);
  return (
    <div>
      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 3000, // Time between transitions (in milliseconds)
          disableOnInteraction: false, // Continue autoplay even after user interaction
        }}
        modules={[Pagination, Autoplay]}
        className="mySwiper"
      >
        {banners?.map((banner) => (
          <SwiperSlide key={banner?._id}>
            <img
              className="w-full max-h-[70vh] h-full"
              src={banner?.image}
              alt="Banner"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <marquee className="bg-[#c5eac5] font-medium playfair py-1 z-[10] relative bottom-2">
        {presentOffer[0]?.offer}
      </marquee>
    </div>
  );
}
