import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  NumberOutlined,
  HomeOutlined,
  GlobalOutlined,
  PushpinOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import "aos/dist/aos.css";
import AOS from "aos";
import "./RegisterUser.css";
import axios from "axios";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const { Option } = Select;

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const RegisterUser = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [managers, setManagers] = useState([]);
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
    AOS.init();
    getManagers();
  }, []);

  const successMessage = (content) => {
    messageApi.open({
      type: "success",
      content,
    });
  };

  const errorMessage = (content) => {
    messageApi.open({
      type: "error",
      content,
    });
  };

  const onFinish = (values) => {
    setLoading(true);
    console.log("Received values:", values);

    axios
      .post(`${backendUrl}/user/register`, values)
      .then((response) => {
        console.log("Data sent to backend:", response.data);
        successMessage("User registered successfully!");
        form.resetFields();
      })
      .catch((error) => {
        console.error("Failed to send data to backend:", error);
        errorMessage("Registration failed. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {contextHolder}
      <div
        className="register-container"
        data-aos="fade-up"
        style={{
          backgroundImage:
            'url("https://img.freepik.com/free-vector/paper-style-white-monochrome-background_52683-66443.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "140vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Form
          form={form}
          name="register_user"
          onFinish={onFinish}
          layout="vertical"
          className="register-form"
        >
          <div className="register-logo">
            <img
              style={{ height: "100px", width: "130px" }}
              src="https://support.saumiccraft.com/wp-content/uploads/2023/05/logo-saumic-new.png"
              alt="Logo"
            />
          </div>

          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="enrollment"
            rules={[
              {
                required: true,
                message: "Please enter your enrollment number",
              },
            ]}
          >
            <Input
              prefix={<NumberOutlined />}
              placeholder="Enter your enrollment number"
            />
          </Form.Item>

          {/* <Form.Item
            name="gst"
            rules={[
              { required: true, message: "Please enter your GST number" },
            ]}
          >
            <Input
              prefix={<FileTextOutlined />}
              placeholder="Enter your GST number"
            />
          </Form.Item> */}

          <Form.Item
            name="mobile"
            rules={[
              {
                required: true,
                message: "Please enter your mobile number",
              },
              {
                pattern: /^[0-9]{10,15}$/,
                message: "Please enter a valid mobile number",
              },
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="Enter your mobile number"
            />
          </Form.Item>

          <Form.Item
            name="country"
            rules={[{ required: true, message: "Please enter your country" }]}
          >
            <Input
              prefix={<GlobalOutlined />}
              placeholder="Enter your country"
            />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[{ required: true, message: "Please enter your address" }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="Enter your address" />
          </Form.Item>

          <Form.Item
            name="state"
            rules={[{ required: true, message: "Please select your state" }]}
          >
            <Select placeholder="Select your state">
              {indianStates.map((state) => (
                <Option key={state} value={state}>
                  {state}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="pincode"
            rules={[
              { required: true, message: "Please enter your pincode" },
              {
                pattern: /^[0-9]{6}$/,
                message: "Please enter a valid 6-digit pincode",
              },
            ]}
          >
            <Input
              prefix={<PushpinOutlined />}
              placeholder="Enter your pincode"
            />
          </Form.Item>

          <Form.Item
            name="manager"
            rules={[{ required: true, message: "Please select your manager" }]}
          >
            <Select
              prefix={<UsergroupAddOutlined />}
              placeholder="Select your manager"
            >
              {managers.map((manager) => (
                <Option key={manager._id} value={manager.name}>
                  {manager.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="register-form-button"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default RegisterUser;
