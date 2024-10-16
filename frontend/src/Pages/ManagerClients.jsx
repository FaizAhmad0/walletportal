import React, { useEffect, useState } from "react";
import ManagerLayout from "../Layout/ManagerLayout";
import axios from "axios";
import { Modal, Button, Input, message, Table } from "antd";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ManagerClients = () => {
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [gmsModalVisible, setGmsModalVisible] = useState(false);
  const [gmsValue, setGmsValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getClients = async () => {
    const name = localStorage.getItem("name");
    try {
      const response = await axios.get(
        `${backendUrl}/user/getmanagerclient/${name}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleAddGms = (client) => {
    setSelectedClient(client);
    setGmsModalVisible(true);
  };

  const handleSubmitGms = async () => {
    if (!gmsValue) {
      message.error("Please enter a valid GMS value");
      return;
    }
    try {
      await axios.put(
        `${backendUrl}/user/updategms/${selectedClient._id}`,
        { gms: gmsValue },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("GMS updated successfully");
      setGmsModalVisible(false);
      setGmsValue("");
      getClients();
    } catch (error) {
      message.error("Failed to update GMS");
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedClient(null);
  };

  const handleCloseGmsModal = () => {
    setGmsModalVisible(false);
    setGmsValue("");
  };

  // Filter clients based on the search query
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.enrollment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.mobile.toString().includes(searchQuery)
  );

  const columns = [
    {
      title: <span className="text-xs">Client Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Email</span>,
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Enrollment</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Phone</span>,
      dataIndex: "mobile",
      key: "mobile",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Balance</span>,
      dataIndex: "amount",
      key: "amount",
      render: (text) => <span className="text-xs">{text.toFixed(3)}</span>,
    },
    {
      title: <span className="text-xs">GMS</span>,
      dataIndex: "gms",
      key: "gms",
      render: (text) => <span className="text-xs">{text.toFixed(3)}</span>,
    },
    {
      title: <span className="text-xs">Action</span>,
      key: "action",
      render: (_, client) => (
        <Button
          className="text-xs italic"
          type="primary"
          onClick={() => handleAddGms(client)}
        >
          Update GMS
        </Button>
      ),
    },
  ];

  return (
    <ManagerLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {localStorage.getItem("name")}'s Clients
        </h1>

        {/* Search input */}
        <Input
          type="text"
          placeholder="Search clients"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "20px", width: "300px" }}
        />

        {/* Ant Design Table */}
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 10 }}
          bordered
          size="small"
        />

        {/* Add GMS Modal */}
        <Modal
          title={`Add GMS for ${selectedClient?.name}`}
          visible={gmsModalVisible}
          onCancel={handleCloseGmsModal}
          footer={[
            <Button key="close" onClick={handleCloseGmsModal}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmitGms}>
              Submit
            </Button>,
          ]}
        >
          <Input
            placeholder="Enter GMS value"
            value={gmsValue}
            onChange={(e) => setGmsValue(e.target.value)}
          />
        </Modal>
      </div>
    </ManagerLayout>
  );
};

export default ManagerClients;
