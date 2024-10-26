import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Select,
  message,
  Table,
  Typography,
  Input,
  Form,
} from "antd";
import AdminLayout from "../Layout/AdminLayout";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Title } = Typography;

const AllClients = () => {
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // New state for edit modal
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
    setIsAssignModalVisible(true);
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
      setIsAssignModalVisible(false);
      getClients();
    } catch (error) {
      message.error("Error assigning manager.");
      console.error("Error assigning manager:", error);
    }
  };

  // New function to show edit modal
  const showEditModal = (client) => {
    setSelectedClient(client);
    setIsEditModalVisible(true);
  };

  // Function to handle client details update
  const handleEditClient = async (values) => {
    console.log(values);
    try {
      await axios.put(
        `${backendUrl}/user/update-client/${selectedClient._id}`,
        values,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      message.success("Client details updated successfully!");
      setIsEditModalVisible(false);
      getClients();
    } catch (error) {
      message.error("Error updating client details.");
      console.error("Error updating client details:", error);
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
  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`${backendUrl}/user/delete/${clientId}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      message.success("Client deleted successfully!");
      getClients(); // Refresh the client list
    } catch (error) {
      message.error("Error deleting client.");
      console.error("Error deleting client:", error);
    }
  };

  const columns = [
    {
      title: <span className="text-sm text-black">Client Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Email</span>,
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Manager</span>,
      dataIndex: "manager",
      key: "manager",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Enrollment</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Phone</span>,
      dataIndex: "mobile",
      key: "mobile",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Balance</span>,
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="text-sm text-black">₹{amount.toFixed(2)}</span>
      ),
    },
    {
      title: <span className="text-sm text-black">GMS</span>,
      dataIndex: "gms",
      key: "gms",
      render: (text) => (
        <span className="text-sm text-black">{text.toFixed(3)}</span>
      ),
    },
    {
      title: <span className="text-sm text-black">Action</span>,
      key: "action",
      render: (text, client) => (
        <div className="flex items-center space-x-2">
          <Button
            className="text-sm text-white"
            type="primary"
            onClick={() => showAssignModal(client)}
          >
            Assign
          </Button>
          <Button
            className="text-sm text-black"
            onClick={() => showEditModal(client)}
          >
            <ModeEditOutlineIcon />
          </Button>
          <Button
            onClick={() => {
              Modal.confirm({
                title: "Are you sure you want to delete this client?",
                onOk: () => handleDeleteClient(client._id),
              });
            }}
            className="ml-2 bg-red-500 text-white"
          >
            <DeleteIcon />
          </Button>
        </div>
      ),
    },
  ];

  // Filter clients based on search query
  const filteredClients = clients.filter(
    (client) =>
      client.enrollment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4 bg-white shadow-lg rounded-lg ">
        {/* Header */}
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">All Clients</h1>
        </div>

        {/* Search and Total Clients */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          {/* Search Input */}
          <Input.Search
            placeholder="Search by enrollment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            enterButton
            style={{ width: "100%", maxWidth: "300px" }}
            className="shadow-md sm:mb-0"
          />
          {/* Total Clients */}
          <div className="flex justify-end items-center space-x-4">
            <Button
              type="primary"
              className="text-sm px-4 bg-gradient-to-r from-blue-500 to-red-300 text-white shadow-lg border-none"
              onClick={downloadCSV}
            >
              <DownloadForOfflineIcon /> Download Users
            </Button>

            <h2 className="text-lg font-bold bg-blue-50 text-blue-800 px-4 py-1 mt-3 rounded-md">
              Total Users: {clients?.length}
            </h2>
          </div>
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto">
          <Table
            dataSource={filteredClients}
            columns={columns}
            rowKey={(record) => record._id}
            bordered
            pagination={{ pageSize: 10 }}
          />
        </div>

        {/* Assign Manager Modal */}
        <Modal
          title="Assign Manager"
          visible={isAssignModalVisible}
          onOk={handleAssignManager}
          onCancel={() => setIsAssignModalVisible(false)}
          okText="Assign"
          cancelText="Cancel"
          centered
          className="rounded-lg"
        >
          <Select
            placeholder="Select a manager"
            onChange={handleManagerSelect}
            className="w-full"
            showSearch
          >
            {managers.map((manager) => (
              <Select.Option key={manager._id} value={manager.name}>
                {manager.name}
              </Select.Option>
            ))}
          </Select>
        </Modal>

        {/* Edit Client Modal */}
        <Modal
          title="Edit Client"
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          centered
        >
          <Form
            layout="vertical"
            initialValues={{
              name: selectedClient?.name,
              email: selectedClient?.email,
              mobile: selectedClient?.mobile,
              amount: selectedClient?.amount,
              gst: selectedClient?.gst,
              enrollment: selectedClient?.enrollment,
            }}
            onFinish={handleEditClient}
          >
            <Form.Item
              label="Client Name"
              name="name"
              rules={[
                { required: true, message: "Please input the client name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Enrollment"
              name="enrollment"
              rules={[
                {
                  required: true,
                  message: "Please input the client enrollment!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input a valid email!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Phone"
              name="mobile"
              rules={[
                { required: true, message: "Please input the phone number!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="GST"
              name="gst"
              rules={[
                { required: true, message: "Please input the GST number!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AllClients;
