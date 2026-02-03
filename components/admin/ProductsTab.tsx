"use client";
import ExpandableProductRow from "@/components/admin/ExpandableProductRow";
import TableSearch from "@/components/admin/TableSearch";
import Pagination from "@/components/ui/Pagination";
import { Loader2, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Modal from "../ui/Modal";
import ProductForm from "./ProductForm";
export default function ProductsTab() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const pageSize = 10;
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(search && { search }),
        ...(category && category !== "All" && { category }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const handleDelete = async (formData: FormData) => {
    const id = Number(formData.get("id"));
    if (!id) return;
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>
      <TableSearch
        placeholder="Search products..."
        filters={[
          {
            key: "category",
            label: "Category",
            options: ["Men", "Women", "Kids", "Electronics", "Accessories"].map(
              (c) => ({ label: c, value: c }),
            ),
          },
        ]}
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : (
                <>
                  {products.map((product) => (
                    <ExpandableProductRow
                      key={product.id}
                      product={product}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && (
        <Pagination
          totalItems={totalItems}
          pageSize={pageSize}
          currentPage={page}
        />
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <ProductForm
          initialData={editingProduct || undefined}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
          }}
        />
      </Modal>
    </div>
  );
}
