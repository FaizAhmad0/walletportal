import React, { useEffect, useState } from "react";
import ManagerLayout from "../Layout/ManagerLayout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button, Table, message, Modal } from "antd";
import * as XLSX from "xlsx";
import moment from "moment";

const BulkOrderDetails = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [skuDetails, setSkuDetails] = useState([]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/orders/${orderId}`,
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );
        setOrderDetails(response.data.order[0]); // Accessing first object directly
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Download sample XLS file
  const downloadSample = () => {
    const sampleData = [
      {
        sku: "SKU001",
        quantity: 10,
        rate: 100,
        size: "17x30",
        totalPayment: 2000,
        whereReceived: "Google Pay",
        paymentDate: "12/11/2024",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "sample_sku_file.xlsx");
  };

  // Upload and process XLS file
  const uploadSkuFile = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      message.error("Please select a file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      try {
        console.log(sheetData);
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/orders/${orderId}/addSku`,
          { sku: sheetData },
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        message.success("SKU data added successfully.");
        setOrderDetails((prev) => ({
          ...prev,
          sku: [...(prev.sku || []), ...sheetData],
        }));
      } catch (error) {
        console.error("Error uploading SKU data:", error);
        message.error("Failed to upload SKU data.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Format date fields
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString() : "N/A";
  };

  // Show SKU Details Modal
  const showSkuDetailsModal = (skuArray) => {
    setSkuDetails(skuArray);
    setIsModalVisible(true);
  };

  // Close SKU Details Modal
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Prepare data for table row
  const formattedData = orderDetails
    ? [
        {
          orderId: orderDetails.orderId,
          enrollment: orderDetails.enrollment,
          brandName: orderDetails.brandName,
          manager: orderDetails.manager,
          orderType: orderDetails.orderType,
          fnsku: orderDetails.fnsku,
          boxLabel: orderDetails.boxLabel,
          remark: orderDetails.remark,
          pickupDate: formatDate(orderDetails.pickupDate),
          createdAt: formatDate(orderDetails.createdAt),
          updatedAt: formatDate(orderDetails.updatedAt),
          sku: (
            <Button
              type="primary"
              onClick={() => showSkuDetailsModal(orderDetails.sku)}
            >
              View Details
            </Button>
          ),
        },
      ]
    : [];

  // Table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD-MM-YYYY"),
    },
    { title: "Enrollment", dataIndex: "enrollment", key: "enrollment" },
    { title: "Brand Name", dataIndex: "brandName", key: "brandName" },
    { title: "Manager", dataIndex: "manager", key: "manager" },
    { title: "Order Type", dataIndex: "orderType", key: "orderType" },
    { title: "Remark", dataIndex: "remark", key: "remark" },
    { title: "Pickup Date", dataIndex: "pickupDate", key: "pickupDate" },
    { title: "SKU Details", dataIndex: "sku", key: "sku" },
  ];

  return (
    <ManagerLayout>
      <div className="px-6 py-4">
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">Order Details</h1>
        </div>

        {/* Order Details Table */}
        {orderDetails ? (
          <Table
            dataSource={formattedData}
            columns={columns}
            pagination={false}
            bordered
            size="middle"
          />
        ) : (
          <p>Loading order details...</p>
        )}

        <div className="mt-6 flex space-x-4">
          {/* Download Sample Button */}
          <Button type="primary" onClick={downloadSample}>
            Download Sample
          </Button>

          {/* Upload SKU Button */}
          <label className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded">
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={uploadSkuFile}
            />
            Add SKU
          </label>
        </div>

        {/* SKU Details Modal */}
        <Modal
          title="SKU Details"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Close
            </Button>,
          ]}
        >
          {skuDetails.length > 0 ? (
            <Table
              dataSource={skuDetails.map((sku, index) => ({
                key: index,
                sku: sku.sku,
                quantity: sku.quantity,
                rate: sku.rate,
                size: sku.size,
                totalPayment: sku.totalPayment,
                whereReceived: sku.whereReceived,
                paymentDate: sku.paymentDate,
              }))}
              columns={[
                { title: "SKU", dataIndex: "sku", key: "sku" },
                { title: "Quantity", dataIndex: "quantity", key: "quantity" },
                { title: "Rate", dataIndex: "rate", key: "rate" },
                { title: "Size", dataIndex: "size", key: "size" },
                {
                  title: "Total Payment",
                  dataIndex: "totalPayment",
                  key: "totalPayment",
                },
                {
                  title: "Where Received",
                  dataIndex: "whereReceived",
                  key: "whereReceived",
                },
                {
                  title: "Payment Date",
                  dataIndex: "paymentDate",
                  key: "paymentDate",
                },
              ]}
              pagination={false}
              bordered
              size="small"
            />
          ) : (
            <p>No SKU details available.</p>
          )}
        </Modal>
      </div>
    </ManagerLayout>
  );
};

export default BulkOrderDetails;
