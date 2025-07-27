import TiptapEditor from "@/components/ui/TipTapEditor";
import { CreateProductModalProps, Product } from "@interfaces/product/product";
import { useState } from "react";

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    qty: 0,
    stock: 0,
    media: [],
    category: [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "qty" || name === "stock"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-black mb-4">
          Create Product
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-black font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-black font-medium">
              Description
            </label>
            {/* <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded p-2 text-black text-sm"
            /> */}
            <TiptapEditor onValueChange={() => {}} value={""} />
          </div>
          <div>
            <label className="block text-sm text-black font-medium">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded p-2 text-black text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-black font-medium">Qty</label>
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleChange}
              className="w-full border rounded text-black p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-black font-medium">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full border rounded p-2 text-black text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
