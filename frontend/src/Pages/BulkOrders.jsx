import React, { useState, useEffect } from "react";
import { Table, Input, Button, Select, message, Popconfirm, Modal } from "antd";
import { SaveOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import DispatchLayout from "../Layout/DispatchLayout";
import "antd/dist/reset.css";
import AdminLayout from "../Layout/AdminLayout";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;

const BulkOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentStages, setPaymentStages] = useState([]);
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
  const getTotalPaidAmount = (paymentStage) => {
    return paymentStage
      ? paymentStage.reduce((acc, stage) => acc + stage.amount, 0)
      : 0;
  };

  const getRemainingAmount = (order) => {
    const totalPaid = getTotalPaidAmount(order.paymentStage);
    return order.totalPrice - totalPaid;
  };
  const handleShowStages = (paymentStage) => {
    setPaymentStages(paymentStage); // Set payment stages for the selected order
    setIsModalVisible(true); // Show modal
  };
  const columns = [
    {
      title: "Order Id",
      dataIndex: "orderId",
      key: "orderId",
      width: "100px",
      className: "text-sm text-black", // Apply text-sm text-black class
    },
    {
      title: "Brand Name",
      dataIndex: "brandName",
      key: "brandName",
      width: "140px",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.enrollment}
            onChange={(e) => handleChange("enrollment", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Manager",
      dataIndex: "managerName",
      key: "managerName",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.managerName}
            onChange={(e) => handleChange("managerName", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Party Name",
      dataIndex: "partyName",
      key: "partyName",
      width: "140px",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.partyName}
            onChange={(e) => handleChange("partyName", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Shipping Address",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.shippingAddress}
            onChange={(e) => handleChange("shippingAddress", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.size}
            onChange={(e) => handleChange("size", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.totalPrice}
            onChange={(e) => handleChange("totalPrice", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{text}</span> // Apply text-sm text-black class to the text
        ),
    },
    {
      title: "Total Paid Amount",
      dataIndex: "paymentStage",
      key: "totalPaidAmount",
      className: "text-sm text-black",

      render: (paymentStage) => getTotalPaidAmount(paymentStage),
    },
    {
      title: "Remaining Amount",
      key: "remainingAmount",
      className: "text-sm text-black",
      render: (record) => {
        const remainingAmount = getRemainingAmount(record);
        if (remainingAmount <= 0) {
          return (
            <span style={{ color: "green", fontWeight: "bold" }}>
              Payment Completed
            </span>
          );
        }
        return <span>{remainingAmount}</span>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) => {
        const formattedDueDate = record.dueDate
          ? new Date(record.dueDate).toISOString().split("T")[0]
          : "";
        return editingKey === record._id ? (
          <Input
            type="date"
            value={formData.dueDate || formattedDueDate} // Use formatted date
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className="text-sm text-black" // Apply text-sm text-black class to the input
          />
        ) : (
          <span className="text-sm text-black">{formattedDueDate}</span> // Apply text-sm text-black class to the text
        );
      },
    },
    {
      title: "Action",
      key: "action",
      className: "text-sm text-black", // Apply text-sm text-black class

      render: (text, record) => {
        if (editingKey === record._id) {
          return (
            <Button
              type="primary"
              onClick={() => handleSubmitEdit(record)}
              icon={<SaveOutlined />}
              className="text-sm text-black"
            >
              Save
            </Button>
          );
        }

        return (
          <div style={{ display: "flex", gap: "8px" }}>
            {" "}
            {/* Flexbox for row alignment */}
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
                  brandName: record.brandName,
                  partyName: record.partyName,
                  shippingAddress: record.shippingAddress,
                  managerName: record.managerName,
                  size: record.size,
                  quantity: record.quantity,
                  price: record.price,
                  totalPrice: record.totalPrice,
                  dueDate: record.dueDate,
                });
                setEditingKey(record._id);
              }}
              icon={<EditOutlined />}
              className="text-sm text-white"
            ></Button>
            <Popconfirm
              title="Are you sure to delete?"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                style={{ background: "red", color: "white" }}
                danger
                icon={<DeleteOutlined />}
                className="text-sm text-black"
              ></Button>
            </Popconfirm>
            <Button
              type="default"
              onClick={() => handleShowStages(record.paymentStage)}
              className="text-sm text-black"
            >
              Payment Stages
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="relative max-w-full mx-auto pb-20 z-10">
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">Bulk Orders</h1>
        </div>{" "}
        <Table
          dataSource={orders} // Display all orders
          columns={columns}
          rowKey={(record) => record._id}
          pagination={false}
          scroll={{ x: 1500 }}
        />
        <Modal
          title="Payment Stages"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Close
            </Button>,
          ]}
        >
          {paymentStages.length > 0 ? (
            <ul>
              {paymentStages.map((stage, index) => (
                <li key={index}>
                  Stage: {stage.stage}, Amount: {stage.amount}
                </li>
              ))}
            </ul>
          ) : (
            <p>No payment stages available</p>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default BulkOrders;
