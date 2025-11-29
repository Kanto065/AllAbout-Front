import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

export default function ProductSearchDropdown({
    mainCategory,
    category,
    onSelect,
    excludeIds = []
}) {
    const axiosPublic = useAxiosPublic();
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [mainCategory, category, search]);

    const fetchProducts = async () => {
        if (!mainCategory || !category) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                mainCategory,
                category,
                ...(search && { search })
            });

            console.log('Fetching products with params:', { mainCategory, category, search });
            const response = await axiosPublic.get(`/products/available-for-group?${params}`);
            console.log('API Response:', response.data);

            if (response.data.success) {
                // Filter out excluded IDs
                const filtered = response.data.products.filter(
                    p => !excludeIds.includes(p._id)
                );
                console.log('Filtered products:', filtered);
                setProducts(filtered);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (product) => {
        setSelectedProduct(product);
        onSelect(product);
    };

    return (
        <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search products in ${mainCategory} > ${category}...`}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Product List */}
            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-gray-500 mb-2">No products available in this category</p>
                        <p className="text-xs text-gray-400">
                            Category: {mainCategory} &gt; {category}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            (Products already in groups are excluded)
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                            Found {products.length} product{products.length !== 1 ? 's' : ''}
                        </div>
                        <div className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <button
                                    key={product._id}
                                    type="button"
                                    onClick={() => handleSelect(product)}
                                    className={`w-full p-3 text-left hover:bg-blue-50 transition ${selectedProduct?._id === product._id ? 'bg-blue-100' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Product Image */}
                                        <img
                                            src={product.images?.[0] || '/placeholder.png'}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 line-clamp-1">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                <span>Price: ৳{product.price}</span>
                                                <span>Cost: ৳{product.cost}</span>
                                                <span className={product.quantity < 10 ? 'text-orange-600' : ''}>
                                                    Stock: {product.quantity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Select Indicator */}
                                        {selectedProduct?._id === product._id && (
                                            <div className="text-blue-600 font-medium">
                                                ✓ Selected
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Selected Product Summary */}
            {
                selectedProduct && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                            ✓ Selected: {selectedProduct.name}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            You can edit the fields below before adding to the group
                        </p>
                    </div>
                )
            }
        </div >
    );
}
