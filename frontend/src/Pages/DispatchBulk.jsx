import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
} from "antd";
import moment from "moment";
import axios from "axios";
import DispatchLayout from "../Layout/DispatchLayout";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const { Option } = Select;

const DispatchBulk = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [form] = Form.useForm();

  const fetchOrders = async () => {
    const manager = localStorage.getItem("name");
    try {
      const response = await axios.get(
        `${backendUrl}/orders/getbulkorder/${manager}`,
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      // Filter orders where shipped is false
      const unshippedOrders = response.data.orders.filter(
        (order) => order.shipped === false
      );

      // Sort the filtered orders by createdAt date
      const sortedOrders = unshippedOrders.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Store the filtered and sorted orders
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Show modal and populate form fields
  const showModal = (orderId) => {
    const selectedOrder = orders.find((order) => order._id === orderId);

    if (selectedOrder) {
      form.setFieldsValue({
        stockStatus: selectedOrder.stockStatus || null,
        stockReadyDate: selectedOrder.stockReadyDate
          ? moment(selectedOrder.stockReadyDate)
          : null,
        shippingAddress: selectedOrder.shippingAddress || "",
        shippingType: selectedOrder.shippingType || null,
        trackingId: selectedOrder.trackingId || "",
      });
    } else {
      form.resetFields(); // If no order is found, reset the form
    }

    setCurrentOrderId(orderId);
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentOrderId(null);
    form.resetFields();
  };

  // Handle form submit
  const handleFormSubmit = async (values) => {
    try {
      const data = {
        ...values,
        stockReadyDate: values.stockReadyDate
          ? values.stockReadyDate.format("YYYY-MM-DD")
          : null,
        orderId: currentOrderId,
      };

      await axios.post(`${backendUrl}/orders/updatebulkorderdetails`, data, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      message.success("Order details updated successfully!");
      handleCancel();
      fetchOrders();
    } catch (error) {
      console.error("Error updating order details:", error);
      message.error("Failed to update order details.");
    }
  };

  // Handle "Shipped" button click
  const handleShippedClick = async (orderId) => {
    try {
      await axios.post(`${backendUrl}/orders/shippedbulkorder`, orderId, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      message.success("Order marked as shipped!");
      fetchOrders(); // Refresh orders list after updating status
    } catch (error) {
      console.error("Error marking order as shipped:", error);
      message.error("Failed to update order status.");
    }
  };

  // Table columns
  const orderColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 300,
      render: (date) => (date ? moment(date).format("DD-MM-YYYY") : "N/A"),
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      width: 150,
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      width: 150,
    },
    {
      title: "Brand Name",
      dataIndex: "brandName",
      key: "brandName",
      width: 200,
    },
    {
      title: "Order Type",
      dataIndex: "orderType",
      key: "orderType",
      width: 150,
    },
    {
      title: "Stock Status",
      dataIndex: "stockStatus",
      key: "stockStatus",
      width: 150,
      render: (status) => (status ? status : "N/A"),
    },
    {
      title: "Stock Ready Date",
      dataIndex: "stockReadyDate",
      key: "stockReadyDate",
      width: 180,
      render: (date) => (date ? moment(date).format("DD-MM-YYYY") : "N/A"),
    },
    {
      title: "Shipping Address",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      width: 300,
      render: (address) => (address ? address : "N/A"),
    },
    {
      title: "Shipping Type",
      dataIndex: "shippingType",
      key: "shippingType",
      width: 150,
      render: (type) => (type ? type : "N/A"),
    },
    {
      title: "Tracking ID",
      dataIndex: "trackingId",
      key: "trackingId",
      width: 200,
      render: (id) => (id ? id : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="primary"
            onClick={() => showModal(record._id)}
            style={{ marginRight: 8 }}
          >
            Add Details
          </Button>
          <Button type="primary" onClick={() => handleShippedClick(record._id)}>
            Shipped
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DispatchLayout>
      <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
        <h1 className="text-2xl pt-4 font-bold text-white">Bulk Order</h1>
      </div>
      <Table
        columns={orderColumns}
        bordered
        dataSource={orders.map((order) => ({ ...order, key: order._id }))}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
      />
      <Modal
        title="Add Order Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="stockStatus"
            label="Stock Status"
            rules={[{ required: true, message: "Please select stock status!" }]}
          >
            <Select placeholder="Select stock status">
              <Option value="Ready">Ready</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>
          <Form.Item name="stockReadyDate" label="Stock Ready Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="shippingAddress"
            label="Shipping Address"
            rules={[
              { required: true, message: "Please enter shipping address!" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter shipping address" />
          </Form.Item>
          <Form.Item
            name="shippingType"
            label="Shipping Type"
            rules={[
              { required: true, message: "Please select shipping type!" },
            ]}
          >
            <Select placeholder="Select shipping type">
              <Option value="transport">Transport</Option>
              <Option value="logistics">Logistics</Option>
              <Option value="amazon">Amazon</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="trackingId"
            label="Tracking ID"
            rules={[{ required: true, message: "Please enter tracking ID!" }]}
          >
            <Input placeholder="Enter tracking ID" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </DispatchLayout>
  );
};

export default DispatchBulk;