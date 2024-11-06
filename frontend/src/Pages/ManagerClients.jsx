import React, { useEffect, useState } from "react";
import ManagerLayout from "../Layout/ManagerLayout";
import axios from "axios";
import { Modal, Button, Input, message, Table, Form } from "antd";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ManagerClients = () => {
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [gmsModalVisible, setGmsModalVisible] = useState(false);
  const [gmsValue, setGmsValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [gstModalVisible, setGstModalVisible] = useState(false); // New state for GST modal
  const [gstValue, setGstValue] = useState(""); // New state for GST value

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

  const handleAddGst = (client) => {
    setSelectedClient(client);
    setGstModalVisible(true);
  };

  const handleGstSubmit = async () => {
    if (!gstValue) {
      message.error("Please enter a valid GST value");
      return;
    }
    try {
      await axios.post(
        `${backendUrl}/user/add-gst/${selectedClient.enrollment}`,
        { gst: gstValue },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("GST updated successfully!");
      setGstModalVisible(false);
      setGstValue("");
      getClients();
    } catch (error) {
      message.error("Could not update the GST!");
      console.error("Error saving GST:", error);
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

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedClient(null);
  };

  const handleCloseGstModal = () => {
    setGstModalVisible(false);
    setGstValue("");
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.enrollment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.mobile.toString().includes(searchQuery)
  );

  const handleEditClient = async (values) => {
    try {
      await axios.put(
        `${backendUrl}/user/update-client/${selectedClient._id}`,
        values,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Client details updated successfully!");
      setIsEditModalVisible(false);
      getClients();
    } catch (error) {
      message.error("Error updating client details.");
      console.error("Error updating client details:", error);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`${backendUrl}/user/delete/${clientId}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      message.success("Client deleted successfully!");
      getClients();
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
      render: (text) => (
        <span className="text-sm text-black">{text.toFixed(3)}</span>
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
      render: (_, client) => (
        <>
          <Button
            className="text-sm text-white"
            type="primary"
            onClick={() => handleAddGms(client)}
          >
            Update GMS
          </Button>
          <Button
            className="text-sm text-black ml-2"
            onClick={() => {
              setSelectedClient(client);
              setIsEditModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            className="text-sm text-black ml-2"
            onClick={() => handleAddGst(client)}
          >
            Add GST
          </Button>
          <Button
            className="text-sm text-black ml-2"
            onClick={() => {
              Modal.confirm({
                title: "Are you sure you want to delete this client?",
                onOk: () => handleDeleteClient(client._id),
              });
            }}
            style={{ background: "red", color: "white" }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <ManagerLayout>
      <div className="container mx-auto px-4 py-2 bg-white shadow-md rounded-md">
        <div className="w-full pb-2 px-4 mb-3 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">All Clients</h1>
        </div>
        <h2 className="text-lg font-bold w-200 bg-blue-50 text-blue-800 px-4 py-1 rounded-md">
          Total Clients: {clients?.length}
        </h2>
        <Input
          type="text"
          placeholder="Search clients"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-6 text-black"
          style={{ width: "300px" }}
        />
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 10 }}
          bordered
          size="small"
          rowClassName="hover:bg-gray-100 transition ease-in-out duration-150"
          className="text-black"
        />

        <Modal
          title={`Add GMS for ${selectedClient?.name}`}
          visible={gmsModalVisible}
          onCancel={handleCloseGmsModal}
          footer={[
            <Button key="close" onClick={handleCloseGmsModal}>
              {" "}
              Cancel{" "}
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmitGms}>
              {" "}
              Submit{" "}
            </Button>,
          ]}
        >
          <Input
            placeholder="Enter GMS value"
            value={gmsValue}
            onChange={(e) => setGmsValue(e.target.value)}
          />
        </Modal>

        <Modal
          title="Edit Client"
          visible={isEditModalVisible}
          onCancel={handleCloseEditModal}
          footer={null}
        >
          <Form
            layout="vertical"
            initialValues={{
              name: selectedClient?.name,
              email: selectedClient?.email,
              mobile: selectedClient?.mobile,
              amount: selectedClient?.amount,
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
              <Input className="text-black" />
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
              <Input className="text-black" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { type: "email", message: "The input is not valid E-mail!" },
                { required: true, message: "Please input the E-mail!" },
              ]}
            >
              <Input className="text-black" />
            </Form.Item>
            <Form.Item
              label="Phone"
              name="mobile"
              rules={[
                { required: true, message: "Please input the client phone!" },
              ]}
            >
              <Input className="text-black" />
            </Form.Item>
            <Form.Item
              label="Balance"
              name="amount"
              rules={[
                { required: true, message: "Please input the client balance!" },
              ]}
            >
              <Input type="number" className="text-black" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button
                type="default"
                onClick={handleCloseEditModal}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`Add GST for ${selectedClient?.name}`}
          visible={gstModalVisible}
          onCancel={handleCloseGstModal}
          footer={[
            <Button key="close" onClick={handleCloseGstModal}>
              {" "}
              Cancel{" "}
            </Button>,
            <Button key="submit" type="primary" onClick={handleGstSubmit}>
              {" "}
              Submit{" "}
            </Button>,
          ]}
        >
          <Input
            placeholder="Enter GST value"
            value={gstValue}
            onChange={(e) => setGstValue(e.target.value)}
          />
        </Modal>
      </div>
    </ManagerLayout>
  );
};

export default ManagerClients;
