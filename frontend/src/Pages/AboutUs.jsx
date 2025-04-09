import React, { useEffect } from "react";
import { Row, Col, Card } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";

const AboutUs = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="bg-white text-gray-800 min-h-screen px-4 py-8 md:py-16">
      {/* Header Section */}
      <section className="text-center mb-12" data-aos="fade-down">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">
          About Saumic Craft
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600">
          A technology-driven creative agency focused on building modern digital
          experiences for the world.
        </p>
      </section>

      {/* Company Overview */}
      <section className="max-w-6xl mx-auto mb-16">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12} data-aos="fade-right">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Who We Are
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Saumic Craft is a creative technology company based in Jaipur,
              Rajasthan. We specialize in delivering cutting-edge digital
              services that help businesses thrive in the modern era. From web
              development to product management and digital marketing, we bring
              your ideas to life with passion and precision.
            </p>
          </Col>
          <Col xs={24} md={12} data-aos="fade-left">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Where We Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Address:</strong> PLOT NO.-18, SHANKAR VIHAR-E, SANGANER,
              SAWAI GETOR, JAGATPURA, Jaipur, Rajasthan, 302017
              <br />
              <strong>Phone:</strong> +1 5589 55488 55
              <br />
              <strong>Email:</strong> info@example.com
            </p>
          </Col>
        </Row>
      </section>

      {/* Our Services */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2
          className="text-2xl font-semibold text-center text-blue-600 mb-8"
          data-aos="fade-up"
        >
          What We Do
        </h2>
        <Row gutter={[24, 24]}>
          {[
            {
              title: "Web Design",
              desc: "We create stunning and user-friendly interfaces that engage your audience.",
            },
            {
              title: "Web Development",
              desc: "From static pages to dynamic platforms, we develop robust websites.",
            },
            {
              title: "Product Management",
              desc: "Helping you plan, develop, and manage your digital products effectively.",
            },
            {
              title: "Marketing",
              desc: "Strategic marketing services to boost your brand visibility and reach.",
            },
          ].map((service, index) => (
            <Col xs={24} sm={12} md={6} key={index} data-aos="zoom-in">
              <Card className="rounded-xl shadow hover:shadow-md transition duration-300">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600">{service.desc}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-4xl mx-auto text-center" data-aos="fade-up">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          Why Choose Us?
        </h2>
        <p className="text-gray-700 leading-relaxed">
          At Saumic Craft, we believe in quality, creativity, and commitment.
          Our team blends innovation with strategy to build powerful digital
          solutions tailored to your vision. We're not just developers — we're
          your digital partners.
        </p>
      </section>

      {/* Footer Note */}
      <footer
        className="mt-16 text-center text-sm text-gray-500"
        data-aos="fade-up"
      >
        <p>
          &copy; {new Date().getFullYear()} <strong>Saumic Craft</strong>. All
          rights reserved.
          <br />
          Powered by <span className="text-red-600">&hearts;</span> MFA
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;
