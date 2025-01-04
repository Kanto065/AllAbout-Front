import Product from "../Cards/Product";

export default function ShowProducts({products}) {
    return (
        <div className="flex flex-wrap justify-center">
            {
                products?.map((product, idx) =>
                    <div key={idx} className="w-1/2 md:w-1/3 lg:w-1/4">
                        <Product product={product} />
                    </div>
                )
            }
        </div>
    )
}
