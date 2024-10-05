import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Modal,
} from "antd";
import { SaveOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import ManagerLayout from "../Layout/ManagerLayout";
import "antd/dist/reset.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const { Option } = Select;

const BulkOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentStages, setPaymentStages] = useState([]);
  const [editingKey, setEditingKey] = useState(""); // Track the currently editing row
  const [formData, setFormData] = useState({
    enrollment: "",
    brandName: "",
    partyName: "",
    shippingAddress: "",
    managerName: localStorage.getItem("name") || "", // prefilled with the logged-in manager's name
    sku: "",
    size: "",
    quantity: "",
    price: "",
    totalPrice: "",
    dueDate: null,
  });

  // Fetch bulk orders
  const getBulkOrders = async () => {
    const manager = localStorage.getItem("name");
    try {
      const response = await axios.get(
        `${backendUrl}/orders/getbulkorder/${manager}`,
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      // Assuming orders have a 'createdAt' field, sort by 'createdAt' in descending order
      const sortedOrders = response.data.orders.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt); // Sorts in descending order
      });

      setOrders(sortedOrders); // Set the sorted orders to state
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const handleShowStages = (paymentStage) => {
    setPaymentStages(paymentStage); // Set payment stages for the selected order
    setIsModalVisible(true); // Show modal
  };

  useEffect(() => {
    getBulkOrders();
  }, []);

  // Calculate total price
  const calculateTotalPrice = (price, quantity) => {
    return price && quantity ? price * quantity : 0;
  };

  const handleChange = (name, value) => {
    let updatedFormData = { ...formData, [name]: value };

    // Recalculate total price if price or quantity is changed
    if (name === "price" || name === "quantity") {
      updatedFormData.totalPrice = calculateTotalPrice(
        updatedFormData.price,
        updatedFormData.quantity
      );
    }

    setFormData(updatedFormData);
  };

  // Handle submitting a new bulk order
  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      managerName: formData.managerName,
    };

    try {
      const response = await axios.post(
        `${backendUrl}/orders/bulkorder`,
        payload,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Order created successfully!");
      setFormData({
        enrollment: "",
        brandName: "",
        partyName: "",
        shippingAddress: "",
        managerName: localStorage.getItem("name") || "",
        sku: "",
        size: "",
        quantity: "",
        price: "",
        totalPrice: "",
        dueDate: null,
      });
      getBulkOrders(); // Refresh orders after saving a new one
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to save data.");
    }
  };

  // Handle editing a row (only sets editingKey without resetting form data)
  const handleEdit = (record) => {
    setEditingKey(record._id); // Set the key of the row being edited
    setFormData({
      ...record,
      dueDate: record.dueDate ? moment(record.dueDate) : null,
      totalPrice: record.price * record.quantity, // Set initial totalPrice for editing
    });
  };

  // Submit the edited data
  const handleSubmitEdit = async (record) => {
    const id = record._id;
    console.log(id);
    const updatedData = {
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
    };

    try {
      await axios.put(`${backendUrl}/orders/bulkupdate/${id}`, updatedData, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      message.success("Order updated successfully!");
      setEditingKey(""); // Exit edit mode
      getBulkOrders(); // Refresh orders
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order.");
    }
  };

  // Handle deleting an order
  const handleDelete = async (record) => {
    const id = record._id;
    try {
      await axios.delete(`${backendUrl}/orders/bulkdelete/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      message.success("Order deleted successfully!");
      getBulkOrders(); // Refresh orders
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

  const columns = [
    {
      title: "OrderId",
      dataIndex: "orderId",
      key: "orderId",
      className: "text-xs",
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            value={formData.enrollment}
            onChange={(e) => handleChange("enrollment", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Brand Name",
      dataIndex: "brandName",
      key: "brandName",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            style={{ width: "100px" }}
            value={formData.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Party Name",
      dataIndex: "partyName",
      key: "partyName",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            style={{ width: "100px" }}
            value={formData.partyName}
            onChange={(e) => handleChange("partyName", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Shipping Address",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            style={{ width: "120px" }}
            value={formData.shippingAddress}
            onChange={(e) => handleChange("shippingAddress", e.target.value)}
          />
        ) : (
          text
        ),
    },
    // {
    //   title: "Manager Name",
    //   dataIndex: "managerName",
    //   key: "managerName",
    // },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            style={{ width: "100px" }}
            value={formData.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            style={{ width: "100px" }}
            value={formData.size}
            onChange={(e) => handleChange("size", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id ? (
          <Input
            style={{ width: "100px" }}
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      className: "text-xs",

      render: (text, record) =>
        editingKey === record._id
          ? formData.totalPrice
          : record.price * record.quantity,
    },
    {
      title: "Total Paid Amount",
      dataIndex: "paymentStage",
      key: "totalPaidAmount",
      className: "text-xs",

      render: (paymentStage) => getTotalPaidAmount(paymentStage),
    },
    {
      title: "Remaining Amount",
      key: "remainingAmount",
      className: "text-xs",
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
      className: "text-xs",
      width: 100,
      render: (dueDate, record) =>
        editingKey === record._id ? (
          <DatePicker
            style={{ width: "100px" }}
            value={formData.dueDate ? moment(formData.dueDate) : null}
            onChange={(date, dateString) => handleChange("dueDate", date)}
          />
        ) : dueDate ? (
          moment(dueDate).format("YYYY-MM-DD")
        ) : (
          "N/A"
        ),
    },
    {
      title: "Action",
      key: "action",
      className: "text-xs",

      render: (text, record) => {
        if (editingKey === record._id) {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Button
                type="primary"
                onClick={() => handleSubmitEdit(record)}
                icon={<SaveOutlined />}
                style={{ flexGrow: 1, marginRight: 8 }} // Flex and margin to align buttons
              >
                Save
              </Button>
            </div>
          );
        }

        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              type="primary"
              onClick={() => handleEdit(record)}
              icon={<EditOutlined />}
              style={{ flexGrow: 1, marginRight: 8 }} // Flex and margin to align buttons
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to delete?"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                style={{
                  background: "red",
                  color: "white",
                  flexGrow: 1,
                  marginRight: 8,
                }} // Flex and margin
                danger
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
            <Button
              type="default"
              onClick={() => handleShowStages(record.paymentStage)} // Show payment stages
              className="text-xs"
              style={{ flexGrow: 1 }} // Flex to align with other buttons
            >
              Show Payment Stages
            </Button>
          </div>
        );
      },
    },
  ];
  const formColumns = [
    {
      title: "Enrollment",
      key: "enrollment",
      render: () => (
        <Input
          value={formData.enrollment}
          onChange={(e) => handleChange("enrollment", e.target.value)}
        />
      ),
    },
    {
      title: "Brand Name",
      key: "brandName",
      render: () => (
        <Input
          value={formData.brandName}
          onChange={(e) => handleChange("brandName", e.target.value)}
        />
      ),
    },
    {
      title: "Party Name",
      key: "partyName",
      render: () => (
        <Input
          value={formData.partyName}
          onChange={(e) => handleChange("partyName", e.target.value)}
        />
      ),
    },
    {
      title: "Shipping Address",
      key: "shippingAddress",
      render: () => (
        <Input
          value={formData.shippingAddress}
          onChange={(e) => handleChange("shippingAddress", e.target.value)}
        />
      ),
    },
    {
      title: "SKU",
      key: "sku",
      render: () => (
        <Input
          value={formData.sku}
          onChange={(e) => handleChange("sku", e.target.value)}
        />
      ),
    },
    {
      title: "Size",
      key: "size",
      render: () => (
        <Input
          value={formData.size}
          onChange={(e) => handleChange("size", e.target.value)}
        />
      ),
    },
    {
      title: "Quantity",
      key: "quantity",
      render: () => (
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) => handleChange("quantity", e.target.value)}
        />
      ),
    },
    {
      title: "Price",
      key: "price",
      render: () => (
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />
      ),
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: () => <Input value={formData.totalPrice} disabled />,
    },
    {
      title: "Due Date",
      key: "dueDate",
      render: () => (
        <DatePicker
          value={formData.dueDate ? moment(formData.dueDate) : null}
          onChange={(date, dateString) => handleChange("dueDate", dateString)}
        />
      ),
    },
  ];

  return (
    <ManagerLayout>
      <h1 className="text-xl font-bold">Create New Order</h1>
      <form id="user-form" onSubmit={handleSubmit}>
        <Table
          dataSource={[formData]} // Show form fields in the table format
          columns={formColumns}
          pagination={false}
          rowKey={() => "form-key"}
          className="min-w-full bg-white shadow-md rounded-lg overflow-hidden"
          scroll={{ x: 1500 }}
        />
        <div className="flex justify-between mt-6 mb-6">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            className="bg-green-500 hover:bg-green-600"
          >
            Save
          </Button>
        </div>
      </form>
      <h1 className="text-xl font-bold">All orders</h1>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
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
    </ManagerLayout>
  );
};

export default BulkOrder;
