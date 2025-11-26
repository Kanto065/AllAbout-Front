import React from 'react';

export default function VariantSelector({ variants, selectedVariant, onSelectVariant }) {
    if (!variants || variants.length === 0) {
        return null;
    }

    // Don't show selector if only one variant
    if (variants.length === 1) {
        return null;
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">
                Available Variants ({variants.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {variants.map((variant) => {
                    const isSelected = selectedVariant?._id === variant._id;
                    const isMainProduct = variant.isMainProduct;
                    const isOutOfStock = variant.quantity < 1;

                    return (
                        <div
                            key={variant._id}
                            onClick={() => !isOutOfStock && onSelectVariant(variant)}
                            className={`
                                relative p-3 rounded-lg border-2 cursor-pointer transition-all
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }
                                ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {/* Main Product Badge */}
                            {isMainProduct && (
                                <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded">
                                    ⭐
                                </div>
                            )}

                            {/* Variant Image */}
                            <div className="aspect-square mb-2 overflow-hidden rounded">
                                <img
                                    src={variant.images?.[0]}
                                    alt={variant.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Variant Name */}
                            <h4 className="text-sm font-medium line-clamp-2 mb-1">
                                {variant.name}
                            </h4>

                            {/* Price */}
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-sm font-bold text-red-600">
                                    ৳{parseInt(variant.price) - (parseInt(variant.price) / 100) * variant.discount}
                                </span>
                                {variant.discount > 0 && (
                                    <>
                                        <span className="text-xs line-through text-gray-400">
                                            ৳{variant.price}
                                        </span>
                                        <span className="text-xs text-green-600">
                                            -{variant.discount}%
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="text-xs">
                                {isOutOfStock ? (
                                    <span className="text-red-500 font-medium">Out of Stock</span>
                                ) : variant.quantity < 5 ? (
                                    <span className="text-orange-500">Only {variant.quantity} left</span>
                                ) : (
                                    <span className="text-green-600">In Stock ({variant.quantity})</span>
                                )}
                            </div>

                            {/* Variant Attributes */}
                            {variant.variantAttributes && Object.keys(variant.variantAttributes).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {Object.entries(variant.variantAttributes).map(([key, value]) => (
                                        <span
                                            key={key}
                                            className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                                        >
                                            {value}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Helper Text */}
            <p className="text-sm text-gray-500 mt-3">
                Click on a variant to view its details and add to cart
            </p>
        </div>
    );
}
