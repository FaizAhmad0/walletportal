import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Select, message, Table, Typography, Input } from "antd";
import AdminLayout from "../Layout/AdminLayout";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Title } = Typography;

const AllClients = () => {
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  const getClients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallclients`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const getManagers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallmanagers`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setManagers(response.data.clients);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  useEffect(() => {
    getClients();
    getManagers();
  }, []);

  const showAssignModal = (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  const handleManagerSelect = (value) => {
    setSelectedManager(value);
  };

  const handleAssignManager = async () => {
    if (!selectedManager) {
      message.error("Please select a manager.");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/user/assign-manager`,
        { clientId: selectedClient._id, manager: selectedManager },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      message.success("Manager assigned successfully!");
      setIsModalVisible(false);
      getClients();
    } catch (error) {
      message.error("Error assigning manager.");
      console.error("Error assigning manager:", error);
    }
  };

  // Function to download CSV
  const downloadCSV = () => {
    const headers = [
      "Client Name",
      "Email",
      "Manager",
      "Enrollment",
      "Phone",
      "Balance",
      "GMS",
    ]; // Define CSV headers

    const rows = clients.map((client) => [
      client.name,
      client.email,
      client.manager,
      client.enrollment,
      client.mobile,
      client.amount,
      client.gms,
    ]); // Convert client data to rows

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clients_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      title: <span className="text-xs">Manager</span>,
      dataIndex: "manager",
      key: "manager",
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
      render: (amount) => (
        <span className="text-xs">₹ {amount.toFixed(3)}</span>
      ),
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
      render: (text, client) => (
        <Button
          className="text-xs italic"
          type="primary"
          onClick={() => showAssignModal(client)}
        >
          Assign Manager
        </Button>
      ),
    },
  ];

  // Filter clients based on search query
  const filteredClients = clients.filter((client) =>
    client.enrollment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mx-auto pr-6 pb-6 pl-6">
        <div>
          <Title level={2} className=" font-bold mb-4 text-sm">
            All Clients
          </Title>
          {/* Search input */}
          <Input
            type="text"
            placeholder="Search by enrollment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input change
            style={{ marginBottom: "20px", width: "30%" }}
          />
          <h2 className="text-sm">Total clients: {clients.length}</h2>
          {/* Download CSV Button */}
          <Button
            type="primary"
            onClick={downloadCSV}
            style={{ marginBottom: "20px" }}
          >
            Download Users
          </Button>
        </div>

        <Table
          dataSource={filteredClients} // Use the filtered clients here
          columns={columns}
          rowKey={(record) => record._id}
          bordered
          pagination={{ pageSize: 10 }}
        />

        {/* Modal to assign manager */}
        <Modal
          title="Assign Manager"
          visible={isModalVisible}
          onOk={handleAssignManager}
          onCancel={() => setIsModalVisible(false)}
          okText="Assign"
          cancelText="Cancel"
        >
          <Select
            style={{ width: "100%" }}
            placeholder="Select a manager"
            onChange={handleManagerSelect}
            showSearch
          >
            {managers.map((manager) => (
              <Select.Option key={manager._id} value={manager.name}>
                {manager.name}
              </Select.Option>
            ))}
          </Select>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AllClients;
