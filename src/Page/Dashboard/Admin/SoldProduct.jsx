import { Helmet } from "react-helmet-async";
import useSoldProducts from "../../../Hooks/useSoldProducts";

const SoldProduct = () => {
    const [soldProducts] = useSoldProducts()
    return (
        <div>
            <Helmet>
                <title>All About Craft BD | Sold Products</title>
            </Helmet>
            <h3 className="text-3xl font-medium">Sold Product</h3>
            <ul className="mt-8 w-full overflow-x-auto">
                {
                    soldProducts?.map((product, idx) =>
                    <li key={idx} className="border-b-2 py-2 w-full">
                                <div className="space-y-1">
                                    <p>Buyer Name: <span className={`font-bold`}>{product?.name}</span></p>
                                    <p>Phone: <span className={`font-bold`}>{product?.phone}</span></p>
                                    <p>Location: <span className={`font-bold`}>{product?.location}</span></p>
                                    <p>Purchased Date: {product?.orderDate}</p>
                                    <p>Pay: <span className={`font-semibold text-green-600`}>{product?.paymentStatus}</span></p>
                                    <p>TR_ID: <span className={`text-green-500`}>{product?.transactionId}</span></p>
                                    <p>Present Status: <span className={`font-semibold text-green-600`}>{product?.status}</span></p>
                                </div>
                                <ol className="grid grid-cols-2 md:grid-cols-3 gap-2 my-2">
                                {
                                    product?.orderProducts?.map((item, idx)=>
                                    <li key={idx} className="flex items-center space-x-2  pb-1 w-full">
                                    <img className="h-12 w-14  rounded-lg" src={item?.images[0]} alt="" />
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-sm mb-2">{item?.name}</h4>
                                        <div className="flex items-center justify-between space-x-4 text-xs">
                                            <p className="">Pice: {item?.numberOfProducts}</p>
                                            <p className="">Price:{item?.price}</p>
                                        </div>
                                    </div>
                                </li>
                                )
                                }
                            </ol>
                        </li>)
                }
            </ul>
            {
                soldProducts?.length === 0 && <div className="flex items-center justify-center">
                    <img className="h-64 w-64 rounded-full" src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif" alt="" />
                </div>
            }
        </div>
    );
};

export default SoldProduct;