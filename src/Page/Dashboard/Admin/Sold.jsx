import { Helmet } from "react-helmet-async";
import Ordered from "./Ordered";
import useSold from "../../../Hooks/useSold";

export default function Sold() {
    const [sold] = useSold();
    return (
        <div> 
            <Helmet>
                <title>All About Craft BD | Sold Products</title>
            </Helmet>
            <div className="flex justify-between">
                <h3 className="text-3xl font-medium">Sold Products {sold?.length}</h3>
            </div>
            <ul className="mt-8 w-full overflow-x-auto px-2">
                {
                    sold?.map((order) =>
                    <Ordered key={order?._id} order={order} />    
                    )
                }
            </ul>
            {
                sold?.length === 0 && <div className="flex items-center justify-center">
                    <img className="h-64 w-64 rounded-full" src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif" alt="" />
                </div>
            }
        </div>
    );
}
