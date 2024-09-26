import React, { useState } from "react";
import { Table, Input, Button, Select, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import DispatchLayout from "../Layout/DispatchLayout";
import "antd/dist/reset.css";
const { Option } = Select;


const OrderReport = () => {
  // Form data as an object
  const [formData, setFormData] = useState({
    name: "",
    enrollment: "",
    amazonOrderId: "",
    manager: "",
    deliveryPartner: "",
    trackingId: "",
    sku: "",
    remarks: "",
    paymentStatus: "",
    address: "",
  });

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value, // Update formData for each input field
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form Data:", formData);

    try {
      const response = await axios.post("/api/save-user-data", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Success:", response.data);
      message.success("Data saved successfully!");
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to save data.");
    }
  };

  const columns = [
    {
      title: "SN.",
      dataIndex: "sn",
      key: "sn",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Brand Name",
      dataIndex: "name",
      key: "name",
      render: (_, __) => (
        <Input
          style={{ width: "100px" }}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      ),
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      render: (_, __) => (
        <Input
          value={formData.enrollment}
          onChange={(e) => handleChange("enrollment", e.target.value)}
        />
      ),
    },
    {
      title: "Amazon Order ID",
      dataIndex: "amazonOrderId",
      key: "amazonOrderId",
      render: (_, __) => (
        <Input
          style={{ width: "120px" }}
          value={formData.amazonOrderId || ""} // Ensure value is defined
          onChange={(e) => handleChange("amazonOrderId", e.target.value)} // Handle changes smoothly
          placeholder="Enter Amazon Order ID"
        />
      ),
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      render: (_, __) => (
        <Select
          value={formData.manager}
          onChange={(value) => handleChange("manager", value)}
        >
          <Option value="">Select Manager</Option>
          <Option value="TL-13">TL-13</Option>
          <Option value="TL-2">TL-2</Option>
          <Option value="TL-6">TL-6</Option>
          <Option value="TL-8">TL-8</Option>
        </Select>
      ),
    },
    {
      title: "Delivery Partner",
      dataIndex: "deliveryPartner",
      key: "deliveryPartner",
      render: (_, __) => (
        <Select
          value={formData.deliveryPartner}
          onChange={(value) => handleChange("deliveryPartner", value)}
        >
          <Option value="">Select Delivery Partner</Option>
          <Option value="Tirupati">Tirupati</Option>
          <Option value="DTDC">DTDC</Option>
        </Select>
      ),
    },
    {
      title: "Tracking ID",
      dataIndex: "trackingId",
      key: "trackingId",
      render: (_, __) => (
        <Input
          style={{ width: "110px" }}
          value={formData.trackingId}
          onChange={(e) => handleChange("trackingId", e.target.value)}
        />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (_, __) => (
        <Input
          style={{ width: "100px" }}
          value={formData.sku}
          onChange={(e) => handleChange("sku", e.target.value)}
        />
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (_, __) => (
        <Input
          style={{ width: "80px" }}
          value={formData.remarks}
          onChange={(e) => handleChange("remarks", e.target.value)}
        />
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (_, __) => (
        <Select
          value={formData.paymentStatus}
          onChange={(value) => handleChange("paymentStatus", value)}
        >
          <Option value="">Select Payment Stage</Option>
          <Option value="1st Stage">1st Stage</Option>
          <Option value="2nd Stage">2nd Stage</Option>
          <Option value="3rd Stage">3rd Stage</Option>
        </Select>
      ),
    },
    {
      title: "Full Address",
      dataIndex: "address",
      key: "address",
      render: (_, __) => (
        <Input
          style={{ width: "200px" }}
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      ),
    },
  ];

  return (
    <DispatchLayout>
      <div className="relative max-w-6xl mx-auto pb-20 z-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Order Report
        </h1>

        <h2 className="text-xl font-semibold text-center text-gray-600 mb-6">
          Detailed Information about the Order Report
        </h2>

        <div className="overflow-x-auto mb-16">
          <form id="user-form" onSubmit={handleSubmit}>
            <Table
              dataSource={[formData]} // Wrapping formData in an array
              columns={columns}
              pagination={false}
              rowKey={(record) => record.amazonOrderId || "default-key"} // Providing a key
              className="min-w-full bg-white shadow-md rounded-lg overflow-hidden"
              scroll={{ x: 1500 }}
            />

            <div className="flex justify-between mt-6">
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
        </div>
      </div>
    </DispatchLayout>
  );
};

export default OrderReport;
