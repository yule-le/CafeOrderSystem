import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productApi";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        imageUrl: product.imageUrl,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      handleCloseModal();
      loadProducts();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Failed to save product";
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (err: any) {
        alert("Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 tracking-wide">
            Product Management
          </h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-neutral-900 text-white px-6 py-2 text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors"
          >
            Add Product
          </button>
        </div>

        <div className="bg-white border border-neutral-300 overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-300">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-16 w-16 object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900 font-light">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 font-light max-w-xs truncate">
                    {product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-light">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-neutral-900 hover:underline hover:font-medium transition-all mr-4 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:underline hover:text-red-700 hover:font-medium transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-3xl w-full p-6 sm:p-8 border border-neutral-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-light text-neutral-900 mb-6 tracking-wide">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-neutral-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 text-neutral-900 font-light focus:outline-none focus:border-neutral-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-neutral-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 text-neutral-900 font-light focus:outline-none focus:border-neutral-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-neutral-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 text-neutral-900 font-light focus:outline-none focus:border-neutral-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-neutral-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 text-neutral-900 font-light focus:outline-none focus:border-neutral-900 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-light text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 text-neutral-900 font-light focus:outline-none focus:border-neutral-900 resize-none text-sm"
                />
              </div>

              {formError && (
                <p className="text-red-600 text-sm font-light mt-4">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-neutral-900 text-white py-2 text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-neutral-200 text-neutral-900 py-2 text-sm font-light tracking-wide hover:bg-neutral-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
