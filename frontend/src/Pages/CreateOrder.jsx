import React, { useState, useEffect } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  Table,
  Input,
  Button,
  Space,
  Tooltip,
  Modal,
  Form,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import DispatchLayout from "../Layout/DispatchLayout";
import axios from "axios";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const CreateOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [gstValue, setGstValue] = useState("");

  const getUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallusers`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const maskMobileNumber = (mobile) => {
    if (!mobile) return "";
    const mobileStr = String(mobile);
    const visibleDigits = mobileStr.slice(-4);
    const maskedDigits = mobileStr.slice(0, -4).replace(/\d/g, "*");
    return `${maskedDigits}${visibleDigits}`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const showGstModal = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleGstSubmit = async () => {
    try {
      console.log(gstValue);
      const response = await axios.post(
        `${backendUrl}/user/add-gst/${selectedUser.enrollment}`,
        { gst: gstValue },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log("GST saved successfully", response.data);
      message.success("Gst updated successfully!");
      setIsModalVisible(false);
      getUsers(); // Refresh user data after saving GST
    } catch (error) {
      message.error("Could not update the gst!");

      console.error("Error saving GST:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setGstValue("");
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = [
    {
      title: <span className="text-sm text-black">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Mob. Number</span>,
      dataIndex: "mobile",
      key: "mobile",
      render: (mobile) => (
        <span className="text-sm text-black">{maskMobileNumber(mobile)}</span>
      ),
    },
    {
      title: <span className="text-sm text-black">Address</span>,
      dataIndex: "address",
      key: "address",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Wallet Balance</span>,
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="text-sm text-black">₹ {amount}.00</span>
      ),
    },
    {
      title: <span className="text-sm text-black">Action</span>,
      key: "action",
      render: (text, user) => (
        <div className="text-sm text-black">
          <Link to={`/add-items/${user.enrollment}`}>
            {user.gst ? (
              <Button className="mr-5 text-sm text-white mb-2" type="primary">
                Add Items
              </Button>
            ) : (
              <Tooltip title={!user.gst ? "Add GST to click" : ""}>
                <Button
                  disabled={!user.gst}
                  className="mr-5 text-sm text-white mb-2"
                  type="primary"
                >
                  Add Items
                </Button>
              </Tooltip>
            )}
          </Link>
          <Button
            className="text-sm text-white px-5"
            type="primary"
            onClick={() => showGstModal(user)}
          >
            Add GST
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DispatchLayout>
      {/* Search Container */}
      <div className="search-container mb-6">
        <Space style={{ width: "100%" }} align="center">
          <Input
            placeholder="Search by Enrollment, Name, Mobile, or Address"
            value={searchTerm}
            onChange={handleSearch}
            allowClear
            prefix={<SearchOutlined className="text-gray-500" />}
            style={{ width: 400, borderRadius: "8px", padding: "6px 12px" }}
            className="shadow-md"
          />
          {searchTerm && (
            <Button
              type="link"
              onClick={handleClearSearch}
              icon={<FaTimesCircle className="text-gray-500" />}
              className="hover:text-red-600"
            />
          )}
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey={(record) => record.enrollment}
        bordered
        pagination={{ pageSize: 7 }}
        className="shadow-lg rounded-lg text-sm"
        style={{ borderRadius: "10px" }}
      />

      {/* Modal for GST */}
      <Modal
        title={<h2 className="text-lg font-semibold">Add GST</h2>}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleGstSubmit}
        okText="Save GST"
        className="rounded-lg"
      >
        <Form layout="vertical" className="text-sm">
          <Form.Item label="GST Number" className="mb-4">
            <Input
              type="text"
              value={gstValue}
              onChange={(e) => setGstValue(e.target.value)}
              placeholder="Enter GST Number"
              className="shadow-sm p-2"
            />
          </Form.Item>
        </Form>
      </Modal>
    </DispatchLayout>
  );
};

export default CreateOrder;
