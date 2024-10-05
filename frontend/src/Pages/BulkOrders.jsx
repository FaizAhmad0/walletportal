import React, { useState, useEffect } from "react";
import { Table, Input, Button, Select, message, Popconfirm } from "antd";
import { SaveOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import DispatchLayout from "../Layout/DispatchLayout";
import "antd/dist/reset.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;

const BulkOrders = () => {
  const [orders, setOrders] = useState([]);
  const [editingKey, setEditingKey] = useState(""); // Track the currently editing row
  const [formData, setFormData] = useState({
    name: "",
    enrollment: "",
    managerName: "",
    deliveryPartner: "",
    trackingId: "",
    sku: "",
    remarks: "",
    paymentStatus: "",
    address: "",
    brandName: "", // New field
    partyName: "", // New field
    shippingAddress: "", // New field
    managerName: "", // New field
    size: "", // New field
    quantity: "", // New field
    price: "", // New field
    totalPrice: "", // New field
    dueDate: "", // New field
  });

  // Fetch orders
  const getOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallbulk`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitEdit = async (record) => {
    const id = record._id;
    const updatedData = { ...formData };

    try {
      await axios.put(`${backendUrl}/orders/bulkupdate/${id}`, updatedData, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      message.success("Order updated successfully!");
      setEditingKey(""); // Exit edit mode
      getOrders(); // Refresh orders
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order.");
    }
  };

  const handleDelete = async (record) => {
    const id = record._id;
    try {
      await axios.delete(`${backendUrl}/orders/bulkdelete/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      message.success("Order deleted successfully!");
      getOrders(); // Refresh orders
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error("Failed to delete order.");
    }
  };

  const columns = [
    {
      title: "Order Id",
      dataIndex: "orderId",
      key: "orderId",
      width: "100px",
      className: "text-xs", // Apply text-xs class
    },
    {
      title: "Brand Name",
      dataIndex: "brandName",
      key: "brandName",
      width: "140px",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.enrollment}
            onChange={(e) => handleChange("enrollment", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Manager",
      dataIndex: "managerName",
      key: "managerName",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.managerName}
            onChange={(e) => handleChange("managerName", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Party Name",
      dataIndex: "partyName",
      key: "partyName",
      width: "140px",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.partyName}
            onChange={(e) => handleChange("partyName", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Shipping Address",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.shippingAddress}
            onChange={(e) => handleChange("shippingAddress", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.size}
            onChange={(e) => handleChange("size", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      className: "text-xs", // Apply text-xs class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.totalPrice}
            onChange={(e) => handleChange("totalPrice", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{text}</span> // Apply text-xs class to the text
        ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      className: "text-xs", // Apply text-xs class

      render: (text, record) => {
        const formattedDueDate = record.dueDate
          ? new Date(record.dueDate).toISOString().split("T")[0]
          : "";
        return editingKey === record._id ? (
          <Input
            type="date"
            value={formData.dueDate || formattedDueDate} // Use formatted date
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className="text-xs" // Apply text-xs class to the input
          />
        ) : (
          <span className="text-xs">{formattedDueDate}</span> // Apply text-xs class to the text
        );
      },
    },
    {
      title: "Action",
      key: "action",
      className: "text-xs", // Apply text-xs class

      render: (text, record) => {
        if (editingKey === record._id) {
          return (
            <Button
              type="primary"
              onClick={() => handleSubmitEdit(record)}
              icon={<SaveOutlined />}
              className="text-xs" // Apply text-xs class to the button
            >
              Save
            </Button>
          );
        }
        return (
          <>
            <Button
              type="primary"
              onClick={() => {
                setFormData({
                  name: record.name,
                  enrollment: record.enrollment,
                  amazonOrderId: record.amazonOrderId,
                  manager: record.manager,
                  deliveryPartner: record.deliveryPartner,
                  trackingId: record.trackingId,
                  sku: record.sku,
                  remarks: record.remarks,
                  paymentStatus: record.paymentStatus,
                  address: record.address,
                  brandName: record.brandName, // Populate with existing data
                  partyName: record.partyName, // Populate with existing data
                  shippingAddress: record.shippingAddress, // Populate with existing data
                  managerName: record.managerName, // Populate with existing data
                  size: record.size, // Populate with existing data
                  quantity: record.quantity, // Populate with existing data
                  price: record.price, // Populate with existing data
                  totalPrice: record.totalPrice, // Populate with existing data
                  dueDate: record.dueDate, // Populate with existing data
                });
                setEditingKey(record._id);
              }}
              icon={<EditOutlined />}
              style={{ marginRight: 8 }}
              className="text-xs" // Apply text-xs class to the button
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to delete?"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                style={{ background: "red", color: "white" }}
                danger
                icon={<DeleteOutlined />}
                className="text-xs" // Apply text-xs class to the button
              >
                Delete
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <DispatchLayout>
      <div className="relative max-w-6xl mx-auto pb-20 z-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bulk Order</h1>
        <Table
          dataSource={orders} // Display all orders
          columns={columns}
          rowKey={(record) => record._id}
          pagination={false}
          scroll={{ x: 1500 }}
        />
      </div>
    </DispatchLayout>
  );
};

export default BulkOrders;