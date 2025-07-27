"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";

import { LoadingSpinner } from "@components/loading/Spinner";
import { AppDispatch, RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "@interfaces/product/product";
import { fetchProductAsync } from "@redux/slices/productSlice";
import { formatRupiah } from "@lib/utils";
import { Pencil, Plus, Trash2, Info } from "lucide-react";
import { EditProductModal } from "@components/product/Edit";
import { CreateProductModal } from "@components/product/Create";
import { DeleteProductModal } from "@components/product/Delete";

const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading, error } = useSelector(
    (state: RootState) => state.product
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedProduct(null);
    setShowDetailModal(false);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteProduct(null);
    setShowDeleteModal(false);
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditProduct(null);
    setShowEditModal(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchProductAsync());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product: Product) =>
      product.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  const columns = useMemo(
    () => [
      {
        name: "No",
        cell: (_: Product, index: number) => (
          <span>{(currentPage - 1) * rowsPerPage + index + 1}</span>
        ),
        sortable: false,
        width: "50px",
      },
      {
        name: "Name",
        selector: (row: Product) => row.name || "-",
        sortable: true,
      },
      {
        name: "Price",
        selector: (row: Product) => formatRupiah(row.price ?? 0),
        sortable: true,
      },
      {
        name: "Qty",
        selector: (row: Product) => row.qty,
        sortable: true,
      },
      {
        name: "Stock",
        selector: (row: Product) => row.stock ?? 0,
        sortable: true,
      },
      {
        name: "Actions",
        cell: (row: Product) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(row)}
              className="text-red-500 hover:text-red-700"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => handleDetail(row)}
              className="text-green-500 hover:text-green-700"
              title="Detail"
            >
              <Info size={16} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [currentPage, rowsPerPage]
  );

  const subHeaderComponent = useMemo(
    () => (
      <div className="flex items-center w-full justify-between my-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded text-sm text-black p-2 w-1/2"
        />
        <button
          onClick={handleCreate}
          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          <Plus size={16} /> Create
        </button>
      </div>
    ),
    [searchTerm]
  );

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center h-screen text-red-500">
        <p>Failed to load products: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 h-screen">
      {showEditModal && editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={closeEditModal}
          onSave={(updatedProduct) => {
            console.log("Updated product:", updatedProduct);
            closeEditModal();
          }}
        />
      )}

      {showCreateModal && (
        <CreateProductModal
          onClose={closeCreateModal}
          onSave={(newProduct) => {
            console.log("New product:", newProduct);
            closeCreateModal();
          }}
        />
      )}

      {showDeleteModal && deleteProduct && (
        <DeleteProductModal
          product={deleteProduct}
          onClose={closeDeleteModal}
          onConfirm={() => {
            console.log("Deleting:", deleteProduct.id);
            closeDeleteModal();
          }}
        />
      )}

      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-black mb-4">
              Product Details
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedProduct.name}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedProduct.description || "-"}
              </p>
              <p>
                <strong>Price:</strong> {formatRupiah(selectedProduct.price)}
              </p>
              <p>
                <strong>Qty:</strong> {selectedProduct.qty}
              </p>
              <p>
                <strong>Stock:</strong> {selectedProduct.stock}
              </p>
              <p>
                <strong>Categories:</strong>{" "}
                {selectedProduct.category?.map((cat) => cat.name).join(", ") ||
                  "-"}
              </p>
              <div>
                <strong className="text-black">Media:</strong>
                {selectedProduct.media && selectedProduct.media.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProduct.media.map((media) => (
                      <img
                        key={media.id}
                        src={media.path}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <p>-</p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredProducts}
        pagination
        defaultSortAsc
        highlightOnHover
        persistTableHead
        subHeader
        subHeaderComponent={subHeaderComponent}
        paginationPerPage={rowsPerPage}
        onChangePage={setCurrentPage}
        onChangeRowsPerPage={(currentRowsPerPage, page) => {
          setRowsPerPage(currentRowsPerPage);
          setCurrentPage(page);
        }}
      />
    </div>
  );
};

export default Products;
