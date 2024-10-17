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
      title: <span className="text-xs">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Mob. Number</span>,
      dataIndex: "mobile",
      key: "mobile",
      render: (mobile) => (
        <span className="text-xs">{maskMobileNumber(mobile)}</span>
      ),
    },
    {
      title: <span className="text-xs">Address</span>,
      dataIndex: "address",
      key: "address",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Wallet Balance</span>,
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <span className="text-xs">₹ {amount}.00</span>,
    },
    {
      title: <span className="text-xs">Action</span>,
      key: "action",
      render: (text, user) => (
        <div className="text-xs">
          <Link to={`/add-items/${user.enrollment}`}>
            {user.gst ? (
              <Button className="mr-5 text-xs mb-2" type="primary">
                Add Items
              </Button>
            ) : (
              <Tooltip title={!user.gst ? "Add GST to click" : ""}>
                <Button
                  disabled={!user.gst}
                  className="mr-5 text-xs mb-2"
                  type="primary"
                >
                  Add Items
                </Button>
              </Tooltip>
            )}
          </Link>
          <Button
            className="text-xs px-5"
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
      <div className="search-container text-xs">
        <Space style={{ marginBottom: 16, width: "100%" }} align="center">
          <Input
            placeholder="Search by Enrollment, Name, Mobile, or Address"
            value={searchTerm}
            onChange={handleSearch}
            allowClear
            prefix={<SearchOutlined className="text-xs" />}
            style={{ width: 400 }}
            className="text-xs"
          />
          {searchTerm && (
            <Button
              type="link"
              onClick={handleClearSearch}
              icon={<FaTimesCircle className="text-xs" />}
            />
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey={(record) => record.enrollment}
        bordered
        pagination={{ pageSize: 7 }}
        className="shadow-sm text-xs"
      />

      <Modal
        title="Add GST"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleGstSubmit}
        okText="Save GST"
      >
        <Form layout="vertical">
          <Form.Item label="GST Number">
            <Input
              type="text"
              value={gstValue}
              onChange={(e) => setGstValue(e.target.value)}
              placeholder="Enter GST Number"
            />
          </Form.Item>
        </Form>
      </Modal>
    </DispatchLayout>
  );
};

export default CreateOrder;
