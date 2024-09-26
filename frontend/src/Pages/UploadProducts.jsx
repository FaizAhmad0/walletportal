import React, { useState, useEffect } from "react";
import DispatchLayout from "../Layout/DispatchLayout";
import { Button, message } from "antd";
import * as XLSX from "xlsx";
import axios from "axios";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const UploadProducts = () => {
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null); // State to store selected file
  const [messageApi, contextHolder] = message.useMessage();
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    price: "",
    gstRate: "",
    hsn: "",
    productId: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const getProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/products/getall`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setFile(selectedFile); // Store the selected file
  };

  const handleBulkUpload = () => {
    if (!file) {
      messageApi.error("Please select a file before uploading.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const formattedProducts = json.map((item) => ({
        sku: item["SKU"] || "",
        name: item["Product Name"] || "",
        price: item["Product Price"] || "",
        gstRate: item["GST Rate"] || "",
        hsn: item["HSN"] || "",
      }));

      try {
        const response = await axios.post(
          `${backendUrl}/products/bulkAdd`,
          { products: formattedProducts },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        messageApi.success("Products uploaded successfully!");
        getProducts(); // Refresh the products after uploading
      } catch (error) {
        console.error("Error uploading products:", error);
        messageApi.error("Failed to upload products.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddOrUpdateProduct = async () => {
    try {
      let response;
      if (editingIndex !== null) {
        // Update product
        const updatedProducts = [...products];
        updatedProducts[editingIndex] = newProduct;
        setEditingIndex(null);
        response = await axios.put(
          `${backendUrl}/products/update/${newProduct.productId}`,
          newProduct,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        messageApi.success("Product updated successfully!");
      } else {
        // Add new product
        response = await axios.post(`${backendUrl}/products/add`, newProduct, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        messageApi.success("Product added successfully!");
      }
      setNewProduct({
        sku: "",
        name: "",
        price: "",
        gstRate: "",
        hsn: "",
        productId: "",
      });
      getProducts();
    } catch (error) {
      console.error("Error sending product data to backend:", error);
      messageApi.error("There was an error processing your request.");
    }
  };

  const handleEditProduct = (index) => {
    setNewProduct({ ...products[index], productId: products[index]._id });
    setEditingIndex(index);
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        SKU: "SKU001",
        "Product Name": "Sample Product",
        "Product Price": "100",
        "GST Rate": "12%",
        HSN: "123456",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "Sample_Products.xlsx");
  };

  return (
    <DispatchLayout>
      {contextHolder}
      <div className="relative max-w-6xl mx-auto pb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Upload Products
        </h2>

        <div className="mb-4">
          <button
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-2"
            onClick={handleDownloadSample}
          >
            Download Sample File
          </button>
          <label className="block text-gray-700 mb-2">
            Bulk Upload Through Excel
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="border border-gray-300 rounded-md py-2 px-4"
          />
          <Button type="primary" onClick={handleBulkUpload}>
            Upload
          </Button>
        </div>

        {/* Single Add/Edit Product Form */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            {editingIndex !== null ? "Edit Product" : "Add Product"}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-black text-xs shadow-md rounded-lg border border-gray-200">
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200">SKU</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <input
                      type="text"
                      name="sku"
                      value={newProduct.sku}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200">
                    Product Name
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200">
                    Product Price
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200">
                    GST Rate
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <input
                      type="number"
                      name="gstRate"
                      value={newProduct.gstRate}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200">HSN</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <input
                      type="text"
                      name="hsn"
                      value={newProduct.hsn}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    className="py-2 px-4 border-b border-gray-200 text-right"
                  >
                    <button
                      type="button"
                      onClick={handleAddOrUpdateProduct}
                      className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                      {editingIndex !== null ? "Update Product" : "Add Product"}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200 p-30">
            <thead className="bg-gray-100">
              <tr className="text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">SKU</th>
                <th className="py-3 px-4 text-left">Product Name</th>
                <th className="py-3 px-4 text-left">Product Price</th>
                <th className="py-3 px-4 text-left">GST Rate</th>
                <th className="py-3 px-4 text-left">HSN</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-xs font-light">
              {products.map((product, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-4 text-left whitespace-nowrap">
                    {product.sku}
                  </td>
                  <td className="py-3 px-4 text-left">{product.name}</td>
                  <td className="py-3 px-4 text-left">{product.price}</td>
                  <td className="py-3 px-4 text-left">{product.gstRate}</td>
                  <td className="py-3 px-4 text-left">{product.hsn}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEditProduct(index)}
                      className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold px-4 py-2 rounded-lg transition duration-200 ease-in-out"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DispatchLayout>
  );
};

export default UploadProducts;
