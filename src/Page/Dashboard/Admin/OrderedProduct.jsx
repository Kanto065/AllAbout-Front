import { Helmet } from "react-helmet-async";
import usePurchased from "../../../Hooks/usePurchased";
import Ordered from "./Ordered";

const OrderedProduct = () => {
    const [purchased, refetch] = usePurchased();
    return (
        <div> 
            <Helmet>
                <title>All About Craft BD | Ordered Products</title>
            </Helmet>
            <div className="flex justify-between">
                <h3 className="text-3xl font-medium">Ordered Products {purchased?.length}</h3>
            </div>
            <ul className="mt-8 w-full overflow-x-auto px-2">
                {
                    purchased?.map((order) =>
                    <Ordered key={order?._id} order={order} refetch={refetch} />    
                    )
                }
            </ul>
            {
                purchased?.length === 0 && <div className="flex items-center justify-center">
                    <img className="h-64 w-64 rounded-full" src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif" alt="" />
                </div>
            }
        </div>
    );
};

export default OrderedProduct;