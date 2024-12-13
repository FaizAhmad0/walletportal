import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../Layout/ManagerLayout";
import EditIcon from "@mui/icons-material/Edit";
import "antd/dist/reset.css";

const { Option } = Select;

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const BulkOrder = () => {
  const [formData, setFormData] = useState({
    enrollment: "",
    brandName: "",
    manager: localStorage.getItem("name") || "",
    orderType: "",
    paymentStatus: "",
    remark: "",
  });
  const [orders, setOrders] = useState([]);
  console.log(orders);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const navigate = useNavigate();

  // Fetch all bulk orders
  const fetchOrders = async () => {
    const manager = localStorage.getItem("name");
    try {
      const response = await axios.get(
        `${backendUrl}/orders/getbulkorder/${manager}`,
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      const sortedOrders = response.data.orders.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${backendUrl}/orders/bulkorder`, formData, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      message.success("Order created successfully!");
      setFormData({
        enrollment: "",
        brandName: "",
        manager: localStorage.getItem("name") || "",
        orderType: "",
        paymentStatus: "",
        remark: "",
      });
      fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      message.error("Failed to create order.");
    }
  };

  const handleRowClick = (orderId) => {
    navigate(`/orders/details/${orderId}`);
  };

  const openModal = (type, orderId) => {
    setModalType(type);
    setSelectedOrderId(orderId);
    setModalVisible(true);
  };

  const handleModalSubmit = async () => {
    try {
      const endpointMap = {
        boxLabel: "update-box-label",
        fnsku: "update-fnsku",
        pickupDate: "update-pickup-date",
      };

      await axios.post(
        `${backendUrl}/orders/${endpointMap[modalType]}`,
        { orderId: selectedOrderId, value: modalValue },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      message.success(`${modalType} updated successfully!`);
      setModalVisible(false);
      setModalValue("");
      fetchOrders();
    } catch (error) {
      console.error(`Error updating ${modalType}:", error`);
      message.error(`Failed to update ${modalType}.`);
    }
  };

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
      title: "Order Type",
      key: "orderType",
      render: () => (
        <Select
          value={formData.orderType}
          onChange={(value) => handleChange("orderType", value)}
          className="w-32"
        >
          <Option value="FBA.IN">FBA.IN</Option>
          <Option value="FBA.COM">FBA.COM</Option>
          <Option value="RE-ORDER">RE-ORDER</Option>
          <Option value="FRENCHISE">FRENCHISE</Option>
        </Select>
      ),
    },
    {
      title: "Payment Status",
      key: "paymentStatus",
      render: () => (
        <Select
          value={formData.paymentStatus}
          onChange={(value) => handleChange("paymentStatus", value)}
          className="w-24"
        >
          <Option value="YES">Pending</Option>
          <Option value="NO">Completed</Option>
        </Select>
      ),
    },
    {
      title: "Remark",
      key: "remark",
      render: () => (
        <Input
          value={formData.remark}
          onChange={(e) => handleChange("remark", e.target.value)}
        />
      ),
    },
  ];

  const orderColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD-MM-YYYY"),
    },
    { title: "Enrollment", dataIndex: "enrollment", key: "enrollment" },
    { title: "Manager", dataIndex: "manager", key: "manager" },
    { title: "Brand Name", dataIndex: "brandName", key: "brandName" },
    { title: "Order Type", dataIndex: "orderType", key: "orderType" },
    { title: "Remark", dataIndex: "remark", key: "remark" },
    {
      title: "Box Label",
      dataIndex: "boxLabel",
      key: "boxLabel",
      render: (boxLabel, record) =>
        boxLabel ? (
          <span>
            {boxLabel}
            <EditIcon
              fontSize="small"
              onClick={() => openModal("boxLabel", record.orderId)}
              className="text-blue-600"
            />
            {/* <Button
              onClick={() => openModal("boxLabel", record.orderId)}
              className=" text-blue-500 hover:bg-blue-600"
            ></Button>{" "} */}
          </span>
        ) : (
          <span className="text-gray-500">
            <Button
              onClick={() => openModal("boxLabel", record.orderId)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Box Label
            </Button>
          </span>
        ),
    },
    {
      title: "FNSKU",
      dataIndex: "fnsku",
      key: "fnsku",
      render: (fnsku, record) =>
        fnsku ? (
          <span>
            {fnsku}{" "}
            <EditIcon
              fontSize="small"
              onClick={() => openModal("fnsku", record.orderId)}
              className="text-blue-600"
            />
            {/* <Button
              onClick={() => openModal("fnsku", record.orderId)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              FNSKU
            </Button> */}
          </span>
        ) : (
          <span className="text-gray-500">
            <Button
              onClick={() => openModal("fnsku", record.orderId)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              FNSKU
            </Button>
          </span>
        ),
    },
    {
      title: "Pickup Date",
      dataIndex: "pickupDate",
      key: "pickupDate",
      render: (pickupDate, record) =>
        pickupDate ? (
          <span>
            {moment(pickupDate).format("DD-MM-YYYY")}{" "}
            <EditIcon
              fontSize="small"
              onClick={() => openModal("pickupDate", record.orderId)}
              className="text-blue-600"
            />
            {/* <Button
              onClick={() => openModal("pickupDate", record.orderId)}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Pickup Date
            </Button> */}
          </span>
        ) : (
          <span className="text-gray-500">
            <Button
              onClick={() => openModal("pickupDate", record.orderId)}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Pickup Date
            </Button>
          </span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/bulkorder/${record.orderId}`)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            View More
          </Button>
          {/* <Button
            onClick={() => openModal("boxLabel", record.orderId)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Box Label
          </Button>
          <Button
            onClick={() => openModal("fnsku", record.orderId)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            FNSKU
          </Button>
          <Button
            onClick={() => openModal("pickupDate", record.orderId)}
            className="bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Pickup Date
          </Button> */}
        </div>
      ),
    },
  ];

  return (
    <ManagerLayout>
      <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
        <h1 className="text-2xl pt-4 font-bold text-white">Bulk Order</h1>
      </div>
      <form id="bulk-order-form" onSubmit={handleSubmit}>
        <Table
          dataSource={[formData]}
          columns={formColumns}
          pagination={false}
          rowKey={() => "form-key"}
        />
        <div className="max-w-full flex justify-between mt-6 mb-6">
          <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
            Create Order
          </Button>
        </div>
      </form>
      <Table
        className="cursor-pointer"
        dataSource={orders}
        columns={orderColumns}
        rowKey="orderId"
        scroll={{ x: 1500 }}
      />
      <Modal
        title={`Update ${modalType}`}
        visible={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
      >
        {modalType === "pickupDate" ? (
          <DatePicker
            onChange={(date) =>
              setModalValue(date ? date.format("YYYY-MM-DD") : "")
            }
          />
        ) : (
          <Select
            value={modalValue}
            onChange={(value) => setModalValue(value)}
            style={{ width: 200 }}
            placeholder={`Select ${modalType}`}
          >
            <Select.Option value="Yes">Yes</Select.Option>
            <Select.Option value="No">No</Select.Option>
          </Select>
        )}
      </Modal>
    </ManagerLayout>
  );
};

export default BulkOrder;
