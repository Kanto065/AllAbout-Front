import useWish from "../../../Hooks/useWish";
import WishItem from "./WishItem";

export default function Wish() {
    const [wish, refetch] = useWish();
    return ( 
        <div className={`pt-5`}>
            <div className="max-w-[90%] 2xl:max-w-7xl mx-auto z-40">
                <div className="w-11/12 md:w-auto mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

                    {
                        wish?.map((product, idx) => (
                            <WishItem key={idx} product={product} reload={refetch} />
                        ))
                    }
                </div>
                {
                    wish?.length === 0 &&
                    <div className="flex items-center justify-center">
                        <img className="h-64 w-64 rounded-full" src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif" alt="no data found" />
                    </div>
                }
            </div>
        </div>
    )
}