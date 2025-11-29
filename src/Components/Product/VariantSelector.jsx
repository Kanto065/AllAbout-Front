import React from 'react';

export default function VariantSelector({
    variants,
    selectedVariant,
    onSelectVariant,
    variantQuantities = {},
    onQuantityChange
}) {
    if (!variants || variants.length === 0) {
        return null;
    }

    // Don't show selector if only one variant
    if (variants.length === 1) {
        return null;
    }

    const handleQuantityChange = (variantId, change) => {
        const variant = variants.find(v => v._id === variantId);
        if (!variant) return;

        const currentQty = variantQuantities[variantId] || 0;
        const newQty = Math.max(0, Math.min(variant.quantity, currentQty + change));

        onQuantityChange(variantId, newQty);
    };

    const handleInputChange = (variantId, value) => {
        const variant = variants.find(v => v._id === variantId);
        if (!variant) return;

        // Parse input value
        const numValue = parseInt(value) || 0;
        const newQty = Math.max(0, Math.min(variant.quantity, numValue));

        onQuantityChange(variantId, newQty);
    };

    return (
        <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
                Available Variants ({variants.length})
            </h3>

            <div className="space-y-2">
                {variants.map((variant) => {
                    const isSelected = selectedVariant?._id === variant._id;
                    const isOutOfStock = variant.quantity < 1;
                    const quantity = variantQuantities[variant._id] || 0;
                    const price = parseInt(variant.price) - (parseInt(variant.price) / 100) * variant.discount;

                    return (
                        <div
                            key={variant._id}
                            className={`
                                flex items-center justify-between p-2 rounded border transition-all
                                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                ${isOutOfStock ? 'opacity-50' : ''}
                            `}
                        >
                            {/* Left: Image + Name + Price */}
                            <div
                                className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                                onClick={() => !isOutOfStock && onSelectVariant(variant)}
                            >
                                {/* Thumbnail */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={variant.images?.[0]}
                                        alt={variant.name}
                                        className="w-12 h-12 object-cover rounded border border-gray-200"
                                    />
                                </div>

                                {/* Name + Price */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {variant.name}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-sm font-semibold text-red-600">
                                            ৳{price}
                                        </span>
                                        {variant.discount > 0 && (
                                            <span className="text-xs text-green-600">
                                                -{variant.discount}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Quantity Selector with Rounded Style */}
                            {!isOutOfStock && (
                                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                    <button
                                        onClick={() => handleQuantityChange(variant._id, -1)}
                                        disabled={quantity <= 0}
                                        className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-lg"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        max={variant.quantity}
                                        value={quantity}
                                        onChange={(e) => handleInputChange(variant._id, e.target.value)}
                                        className="w-12 h-8 text-center font-semibold text-sm text-gray-900 bg-white border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(variant._id, 1)}
                                        disabled={quantity >= variant.quantity}
                                        className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Helper Text */}
            <p className="text-xs text-gray-500 mt-2">
                💡 Click on variant to view details. Use +/− or type quantity directly.
            </p>
        </div>
    );
}
