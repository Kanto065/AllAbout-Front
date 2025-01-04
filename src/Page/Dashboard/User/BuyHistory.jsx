import useOrderedProduct from "../../../Hooks/useOrderedProduct"
import useSoldProducts from "../../../Hooks/useSoldProducts";
import UserOrderCard from "../../../Shared-Components/Card/UserOrderCard";
import UserPurchaseCard from "../../../Shared-Components/Card/UserPurchaseCard";

export default function BuyHistory() {
    const [orderedProduct, refetch] = useOrderedProduct();
    const [soldProducts] = useSoldProducts();

    return (
        <div className="space-y-10">
            <div className="bg-white p-4 xl:p-8">
                <h1 className="text-2xl font-bold">Your Order List</h1>
                <div className="space-y-4 mt-2">
                    {
                        orderedProduct?.map((product, idx) =>
                            <UserOrderCard key={idx} product={product} idx={idx} />
                        )
                    }
                    {
                        orderedProduct?.length === 0 &&
                        <div className="flex items-center justify-center">
                            <img className="h-64 w-64 rounded-full" src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif" alt="no data found" />
                        </div>
                    }
                </div>
            </div>
            <div className="bg-white p-4 xl:p-8">
                <h1 className="text-2xl font-bold">Your Purchase List</h1>
                <div className="space-y-4">
                    {
                        soldProducts?.map((product, idx) =>
                            <UserPurchaseCard key={idx} product={product} idx={idx} />
                        )}
                    {
                        soldProducts?.length === 0 &&
                        <div className="flex items-center justify-center">
                            <img className="h-64 w-64 rounded-full" src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif" alt="no data found" />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}