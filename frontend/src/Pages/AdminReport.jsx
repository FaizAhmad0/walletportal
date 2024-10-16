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
      className: "text-xs",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "text-xs",
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      className: "text-xs",
    },
    {
      title: "Phone",
      dataIndex: "mobile",
      key: "mobile",
      className: "text-xs",
    },
    {
      title: "Balance",
      dataIndex: "amount",
      key: "amount",
      className: "text-xs",
      render: (text) => <span className="text-xs">{text.toFixed(3)}</span>,
    },
    {
      title: "GMS",
      dataIndex: "gms",
      key: "gms",
      className: "text-xs",
      render: (text) => <span className="text-xs">{text.toFixed(3)}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          className="text-xs italic"
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
      <div className="container mx-auto p-6 pt-0">
        <Title level={2} className="font-bold mb-4">
          Here are all the Managers
        </Title>
        <Input
          placeholder="Search by enrollment"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "30%", marginBottom: "16px" }}
        />
        {filteredClients.length > 0 ? (
          <Table
            dataSource={filteredClients}
            columns={columns}
            pagination={false}
            rowKey="enrollment"
            bordered
            className="text-xs"
          />
        ) : (
          <p className="text-center text-gray-600">No manager found.</p>
        )}
      </div>

      <Modal
        title="Manager's Clients"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        {selectedManagerClients.length > 0 ? (
          <Table
            dataSource={selectedManagerClients}
            columns={[
              {
                title: "Name",
                dataIndex: "name",
                key: "name",
                className: "text-xs",
              },
              {
                title: "Enrollment",
                dataIndex: "enrollment",
                key: "enrollment",
                className: "text-xs",
              },
              {
                title: "Email",
                dataIndex: "email",
                key: "email",
                className: "text-xs",
              },
              {
                title: "GMS",
                dataIndex: "gms",
                key: "gms",
                className: "text-xs",
                render: (text) => (
                  <span className="text-xs">{text.toFixed(3)}</span>
                ),
              },
            ]}
            pagination={false}
            rowKey="enrollment"
          />
        ) : (
          <p>No clients found for this manager.</p>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminReport;
