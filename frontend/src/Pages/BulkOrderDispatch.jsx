import React, { useState } from "react";
import { Table, Input, Button, Select, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import ManagerLayout from "../Layout/ManagerLayout";
import "antd/dist/reset.css";
const backendUrl = process.env.REACT_APP_BACKEND_URL;


const { Option } = Select;

const BulkOrderDispatch = () => {
  const [formData, setFormData] = useState({
    name: "",
    enrollment: "",
    amazonOrderId: "",
    deliveryPartner: "",
    sku: "",
    address: "",
  });

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const manager = localStorage.getItem("name");
    const payload = {
      ...formData,
      manager,
    };

    console.log("Form Data:", payload);

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
      console.log("Success:", response.data);
      message.success("Data saved successfully!");
      setFormData("");
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to save data.");
    }
  };

  const columns = [
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
          value={formData.amazonOrderId}
          onChange={(e) => handleChange("amazonOrderId", e.target.value)}
        />
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
    <ManagerLayout>
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
              dataSource={[formData]}
              columns={columns}
              pagination={false}
              rowKey={(record) => record.amazonOrderId || "default-key"}
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
    </ManagerLayout>
  );
};

export default BulkOrderDispatch;
