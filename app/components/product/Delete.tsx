import { DeleteProductModalProps } from "@interfaces/product/product";

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Confirm Delete
        </h2>
        <p className="mb-4">
          Are you sure you want to delete <strong>{product.name}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
