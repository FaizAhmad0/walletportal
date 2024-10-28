import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { Modal, Button, Table, Input, Typography } from "antd";

const { Title } = Typography;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AdminReport = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManagerClients, setSelectedManagerClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const getClients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallmanagers`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClientsClick = async (managerName) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/user/getmanagerclients`,
        { managerName },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setSelectedManagerClients(response.data.clients);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching manager clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedManagerClients([]);
  };

  const columns = [
    {
      title: "Manager Name",
      dataIndex: "name",
      key: "name",
      className: "text-sm text-black",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "text-sm text-black",
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      className: "text-sm text-black",
    },
    {
      title: "Phone",
      dataIndex: "mobile",
      key: "mobile",
      className: "text-sm text-black",
    },
    {
      title: "Balance",
      dataIndex: "amount",
      key: "amount",
      className: "text-sm text-black",
      render: (text) => (
        <span className="text-sm text-black">{text.toFixed(3)}</span>
      ),
    },
    {
      title: "GMS",
      dataIndex: "gms",
      key: "gms",
      className: "text-sm text-black",
      render: (text) => (
        <span className="text-sm text-black">{text.toFixed(3)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          className="text-sm text-white "
          onClick={() => handleViewClientsClick(record.name)}
          loading={loading}
        >
          View Clients
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-2 bg-white shadow-lg rounded-lg">
        {/* Page Title */}
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">
            Manager's Overview
          </h1>
        </div>

        {/* Search Input */}
        <div className="my-4 flex justify-between items-center">
          <Input
            placeholder="Search by enrollment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "30%", padding: "10px" }}
            className="shadow-md rounded-md"
          />
        </div>

        {/* Managers Table */}
        {filteredClients.length > 0 ? (
          <Table
            dataSource={filteredClients}
            columns={columns}
            pagination={false}
            rowKey="enrollment"
            bordered
            className="rounded-lg shadow-sm text-sm"
            style={{ fontSize: "14px" }}
          />
        ) : (
          <p className="text-center text-gray-600 py-6">No managers found.</p>
        )}
      </div>

      {/* Modal for Manager's Clients */}
      <Modal
        title="Manager's Clients"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" type="primary" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        className="rounded-lg"
      >
        {selectedManagerClients.length > 0 ? (
          <Table
            dataSource={selectedManagerClients}
            columns={[
              {
                title: "Name",
                dataIndex: "name",
                key: "name",
                className: "text-sm text-black",
              },
              {
                title: "Enrollment",
                dataIndex: "enrollment",
                key: "enrollment",
                className: "text-sm text-black",
              },
              {
                title: "Email",
                dataIndex: "email",
                key: "email",
                className: "text-sm text-black",
              },
              {
                title: "GMS",
                dataIndex: "gms",
                key: "gms",
                className: "text-sm text-black",
                render: (text) => (
                  <span className="text-sm text-black">
                    ₹ {text.toFixed(3)}
                  </span>
                ),
              },
            ]}
            pagination={false}
            scroll={{ x: true }}
            rowKey="enrollment"
            className="rounded-lg shadow-sm text-sm text-black"
          />
        ) : (
          <p className="text-center text-gray-600 py-6">
            No clients found for this manager.
          </p>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminReport;
