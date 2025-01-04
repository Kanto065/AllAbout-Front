import Hero from "./Hero";
import MainCategories from "./MainCategories";
import Products from "./Products";
import TopSell from "./TopSell";

export default function Home() {
  return (
    <div className="mt-[85px]">
      <div className="">
        <div className="z-10">
          <Hero />
        </div>
        <div className="max-w-[1400px] mx-auto z-50">
          <MainCategories />
          <TopSell />
        </div>
      </div>
      <Products />
    </div>
  );
}
