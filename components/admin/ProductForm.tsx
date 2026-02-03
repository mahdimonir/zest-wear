"use client";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string | null;
  size: string[];
  color: string[];
  hasVariants: boolean;
  images?: any[];
}
interface ProductFormProps {
  initialData?: Product;
  onSuccess?: () => void;
}
export default function ProductForm({
  initialData,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Product>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    quantity: initialData?.quantity || 0,
    imageUrl: initialData?.imageUrl || "",
    category: initialData?.category || "",
    size: initialData?.size || [],
    color: initialData?.color || [],
    hasVariants: initialData?.hasVariants || false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.imageUrl || "",
  );
  const [availableSizes] = useState(["S", "M", "L", "XL", "XXL"]);
  const [availableColors] = useState([
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Yellow",
  ]);
  const [variantImages, setVariantImages] = useState<{ [key: string]: File }>(
    {},
  );
  const [variantPreviews, setVariantPreviews] = useState<{
    [key: string]: string;
  }>({});
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrl: "uploading" }));
    }
  };
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };
  const handleSizeChange = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter((s) => s !== size)
        : [...prev.size, size],
    }));
  };
  const handleColorChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      color: prev.color.includes(color)
        ? prev.color.filter((c) => c !== color)
        : [...prev.color, color],
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!imagePreview && !formData.imageUrl) {
        toast.error("Please upload a product image");
        setIsSubmitting(false);
        return;
      }
      const url = initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";
      const method = initialData?.id ? "PATCH" : "POST";
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price.toString());
      data.append("quantity", formData.quantity.toString());
      data.append("category", formData.category || "");
      data.append("hasVariants", formData.hasVariants.toString());
      formData.size.forEach((s) => data.append("size", s));
      formData.color.forEach((c) => data.append("color", c));
      if (imageFile) {
        data.append("image", imageFile);
      } else if (formData.imageUrl && formData.imageUrl !== "uploading") {
        data.append("imageUrl", formData.imageUrl);
      }
      Object.entries(variantImages).forEach(([color, file]) => {
        data.append(`variantImage_${color}`, file);
      });
      const response = await fetch(url, {
        method,
        body: data,
      });
      if (!response.ok) {
        throw new Error("Failed to save product");
      }
      toast.success(
        `Product ${initialData?.id ? "updated" : "created"} successfully`,
      );
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/products");
      }
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (৳)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>
        {}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            {!imagePreview ? (
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">
                  Click to upload image
                </span>
              </div>
            ) : (
              <div className="relative h-48 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: JPG, PNG, WebP. Max size: 10MB.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="hasVariants"
              name="hasVariants"
              checked={formData.hasVariants}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor="hasVariants"
              className="text-sm font-medium text-gray-700"
            >
              Product has variants (Size/Color)
            </label>
          </div>
          {formData.hasVariants && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className={`px-3 py-1 text-xs rounded border transition-colors ${
                        formData.size.includes(size)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Colors & Variant Images
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`px-3 py-1 text-xs rounded border transition-colors ${
                        formData.color.includes(color)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {}
                <div className="space-y-3 mt-4">
                  {formData.color.map((color) => (
                    <div
                      key={color}
                      className="flex items-center gap-4 bg-white p-2 rounded border border-gray-200"
                    >
                      <span className="text-sm font-medium w-16">{color}</span>
                      <div className="flex-1">
                        <div className="relative flex items-center gap-2">
                          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-xs text-gray-700 flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            {variantImages[color] ||
                            initialData?.images?.find(
                              (img: any) => img.color === color,
                            )?.url
                              ? "Change Image"
                              : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setVariantImages((prev) => ({
                                    ...prev,
                                    [color]: file,
                                  }));
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setVariantPreviews((prev) => ({
                                      ...prev,
                                      [color]: ev.target?.result as string,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {(variantPreviews[color] ||
                            initialData?.images?.find(
                              (img: any) => img.color === color,
                            )?.url) && (
                            <div className="relative w-8 h-8 rounded overflow-hidden border border-gray-300">
                              <Image
                                src={
                                  variantPreviews[color] ||
                                  initialData?.images?.find(
                                    (img: any) => img.color === color,
                                  )?.url ||
                                  ""
                                }
                                alt={color}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
