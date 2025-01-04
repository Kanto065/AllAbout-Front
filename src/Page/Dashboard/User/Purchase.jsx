import usePurchased from "../../../Hooks/usePurchased";
import PurchasedItem from "./PurchasedItem";

export default function Purchase() {
    const [purchased, refetch] = usePurchased();

 
    return (
        <div className="pt-5">
            <div className="max-w-[90%] 2xl:max-w-7xl mx-auto z-40">
                <h1 className="text-3xl font-bold mb-8 text-center">Your Purchases</h1>
                <div className="space-y-4">
                    {purchased?.map((order) => (
                        <PurchasedItem key={order?._id} order={order} refetch={refetch} />
                    ))}
                </div>

                {purchased?.length === 0 && (
                    <div className="flex items-center justify-center mt-10">
                        <img
                            className="h-64 w-64 rounded-full"
                            src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif"
                            alt="No data found"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
