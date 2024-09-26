import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { Modal, Input, message } from "antd";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const WalletAction = () => {
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionType, setActionType] = useState(""); // To identify Add or Deduct action
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const getClients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallclients`, {
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

  const handleActionClick = (client, type) => {
    setSelectedClient(client);
    setActionType(type);
    setIsModalVisible(true);
  };

  // Submit the amount and reason to the backend
  const handleSubmit = async () => {
    if (!amount || !reason) {
      message.error("Please fill in all fields");
      return;
    }

    try {
      const data = {
        clientId: selectedClient._id,
        amount,
        reason,
        actionType,
      };

      const response = await axios.post(
        `${backendUrl}/wallet-action/${actionType}`,
        data,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success(response.data.message);

      // Reset fields and close modal
      setIsModalVisible(false);
      setAmount("");
      setReason("");
      getClients(); // Refresh client data after update
    } catch (error) {
      message.error("Error performing action");
      console.error("Error performing wallet action:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {/* Here is all the Clients */}
        </h1>

        {clients?.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200 shadow-lg text-xs">
            <thead className="bg-gray-200">
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border border-gray-300">
                  Client Name
                </th>
                <th className="px-4 py-2 border border-gray-300">Email</th>
                <th className="px-4 py-2 border border-gray-300">Enrollment</th>
                <th className="px-4 py-2 border border-gray-300">Phone</th>
                <th className="px-4 py-2 border border-gray-300">Balance</th>
                <th className="px-4 py-2 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr
                  key={index}
                  className="text-center hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 border border-gray-300">
                    {client.name}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.email}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.enrollment}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.mobile}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.amount}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 italic"
                      onClick={() => handleActionClick(client, "add")}
                    >
                      Add Money
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md italic"
                      onClick={() => handleActionClick(client, "deduct")}
                    >
                      Deduct Money
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">No clients found.</p>
        )}

        {/* Ant Design Modal */}
        <Modal
          title={actionType === "add" ? "Add Money" : "Deduct Money"}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleSubmit}
        >
          <div className="mb-4 text-xs">
            <label>Amount:</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div className="text-xs">
            <label>Reason:</label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason"
            />
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default WalletAction;
