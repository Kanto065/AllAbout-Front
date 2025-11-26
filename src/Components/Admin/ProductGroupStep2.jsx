import VariantCard from './VariantCard';
import { IoMdAdd } from 'react-icons/io';

export default function ProductGroupStep2({ variants, setVariants, sharedInfo, onNext, onBack, onCancel }) {

    const handleVariantChange = (index, updatedVariant) => {
        const newVariants = [...variants];
        newVariants[index] = updatedVariant;
        setVariants(newVariants);
    };

    const handleAddVariant = () => {
        setVariants([
            ...variants,
            {
                name: '',
                price: 0,
                cost: 0,
                quantity: 0,
                discount: 0,
                imageFiles: [],
                variantAttributes: {}
            }
        ]);
    };

    const handleRemoveVariant = (index) => {
        if (variants.length === 1) {
            alert('You must have at least one variant!');
            return;
        }

        if (window.confirm('Are you sure you want to remove this variant?')) {
            const newVariants = variants.filter((_, i) => i !== index);
            setVariants(newVariants);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const hasEmptyNames = variants.some(v => !v.name || v.name.trim() === '');
        if (hasEmptyNames) {
            alert('Please fill in all variant names!');
            return;
        }

        const hasNoImages = variants.some(v => !v.imageFiles || v.imageFiles.length === 0);
        if (hasNoImages) {
            alert('Please upload at least one image for each variant!');
            return;
        }

        const hasInvalidPricing = variants.some(v => v.price <= 0 || v.cost < 0);
        if (hasInvalidPricing) {
            alert('Please enter valid prices and costs for all variants!');
            return;
        }

        const hasInvalidQuantity = variants.some(v => v.quantity < 0);
        if (hasInvalidQuantity) {
            alert('Please enter valid quantities for all variants!');
            return;
        }

        onNext();
    };

    // Calculate totals
    const totalQuantity = variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0);
    const prices = variants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-2">Add Product Variants</h3>
                <p className="text-gray-600 mb-4">
                    Create individual products for each variant. The first variant will be the main product.
                </p>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
                    <div>
                        <p className="text-sm text-gray-600">Total Variants</p>
                        <p className="text-2xl font-bold text-blue-600">{variants.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Quantity</p>
                        <p className="text-2xl font-bold text-green-600">{totalQuantity}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Price Range</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {minPrice === maxPrice ? `৳${minPrice}` : `৳${minPrice} - ৳${maxPrice}`}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Low Stock Alert</p>
                        <p className={`text-2xl font-bold ${totalQuantity < 10 ? 'text-red-600' : 'text-gray-400'}`}>
                            {totalQuantity < 10 ? 'Yes ⚠️' : 'No ✓'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Variant Cards */}
            <div className="space-y-4">
                {variants.map((variant, index) => (
                    <VariantCard
                        key={index}
                        variant={variant}
                        index={index}
                        isMain={index === 0}
                        onChange={handleVariantChange}
                        onRemove={handleRemoveVariant}
                        canRemove={variants.length > 1}
                    />
                ))}
            </div>

            {/* Add Variant Button */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition"
                >
                    <IoMdAdd className="text-2xl" />
                    <span className="font-medium">Add Another Variant</span>
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                    >
                        ← Back
                    </button>
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Next: Review & Publish →
                </button>
            </div>
        </form>
    );
}
