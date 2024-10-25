import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { Table, Input, Typography, Button, Modal, Form, message } from "antd";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";

const { Search } = Input;
const { Title } = Typography;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AllManagers = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null); // State for the selected client

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

  // Filter clients by enrollment based on search term
  const filteredClients = clients.filter((client) =>
    client.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to download CSV
  const downloadCSV = () => {
    const headers = ["Manager Name", "Email", "Enrollment", "Phone", "GMS"]; // Define CSV headers

    const rows = clients.map((client) => [
      client.name,
      client.email,
      client.enrollment,
      client.mobile,
      client.gms,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "managers_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClient = async (values) => {
    try {
      await axios.put(
        `${backendUrl}/user/update/${selectedClient._id}`,
        values,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Manager updated successfully!");
      setIsEditModalVisible(false);
      getClients(); // Refresh the client list
    } catch (error) {
      message.error("Error updating manager.");
      console.error("Error updating manager:", error);
    }
  };

  // Function to handle delete action
  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`${backendUrl}/user/delete/${clientId}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      message.success("Manager deleted successfully!");
      getClients(); // Refresh the client list
    } catch (error) {
      message.error("Error deleting manager.");
      console.error("Error deleting manager:", error);
    }
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
      render: (_, client) => (
        <>
          <Button
            className="font-semibold"
            type="primary"
            onClick={() => {
              setSelectedClient(client);
              setIsEditModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            onClick={() => {
              Modal.confirm({
                title: "Are you sure you want to delete this manager?",
                onOk: () => handleDeleteClient(client._id),
              });
            }}
            style={{
              marginLeft: "8px",
              background: "red",
              color: "white",
              fontStyle: "font-semibold",
            }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 bg-white shadow-md rounded-lg">
        {/* Title */}
        <h1 className="text-2xl font-bold">All Managers</h1>

        {/* Search input and Actions */}
        <div className="flex justify-between items-center">
          {/* Search input */}

          <Input.Search
            placeholder="Search by enrollment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            enterButton
            style={{ width: "100%", maxWidth: "300px" }}
            className="shadow-md sm:mb-0"
          />
          {/* Actions (Download button and total managers) */}
          <div className="flex items-center">
            {/* CSV Download Button */}
            <Button
              type="primary"
              onClick={downloadCSV}
              style={{
                marginRight: "10px",
                fontSize: "small",
                fontWeight: "bold",
              }}
            >
              <DownloadForOfflineIcon />
              Download Managers
            </Button>

            {/* Managers count */}
            <h2 className="text-lg font-bold bg-blue-50 text-blue-800 px-4 py-1 mt-3 rounded-md">
              Total Managers: {clients?.length}
            </h2>
          </div>
        </div>

        {/* Managers Table */}
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 7 }}
          bordered
          className="managers-table shadow-sm"
          style={{ borderRadius: "8px", overflow: "hidden" }}
        />

        {/* No results message */}
        {filteredClients.length === 0 && (
          <div className="flex justify-center mt-6">
            <p className="text-center text-gray-500">No managers found.</p>
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          title="Edit Manager"
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
              enrollment: selectedClient?.enrollment,
            }}
            onFinish={handleEditClient}
          >
            <Form.Item
              label="Manager Name"
              name="name"
              rules={[
                { required: true, message: "Please input the manager name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Enrollment"
              name="enrollment"
              rules={[
                { required: true, message: "Please input the enrollment!" },
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

export default AllManagers;
