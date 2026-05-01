import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import Footer from "./Footer";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
} from "react-icons/fi";

const SITE_KEY = "6LcCLpkrAAAAAPDSzN2dcfQ0Be_AbQUFVmI7W8Hu";

export default function Contact() {
  const contactEmailRef = useRef();

  const [formData, setFormData] = useState({
    message: "",
    name: "",
    company: "",
    email: "",
    mobile: "",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ===== INPUT HANDLER =====
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===== AUTO HIDE SUCCESS =====
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.company ||
      !formData.message ||
      !formData.consent
    ) {
      setErrorMessage("Please fill all fields and accept consent");
      return;
    }

    try {
      setLoading(true);

      const token = await window.grecaptcha.execute(SITE_KEY, {
        action: "submit",
      });

      const submitData = new FormData();
      submitData.append("from_email", formData.email);
      submitData.append("from_name", formData.name);
      submitData.append("message", formData.message);
      submitData.append("mobile", formData.mobile);
      submitData.append("company", formData.company);
      submitData.append("recaptcha_token", token);
      submitData.append(
        "to_email",
        contactEmailRef.current?.textContent?.trim()
      );

      await axios.post(
        "https://inoptics.in/api/submit_contact_form.php",
        submitData
      );

      setSuccessMessage("Message sent successfully!");
      setErrorMessage("");

      setFormData({
        message: "",
        name: "",
        company: "",
        email: "",
        mobile: "",
        consent: false,
      });
    } catch (err) {
      setErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ===== HEADER ===== */}
      <div className="text-center py-12 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800">
          Get in touch, let us know how we can help
        </h2>
      </div>

      {/* ===== MAIN SECTION ===== */}
      <div className="max-w-5xl mx-auto px-4">

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2">

          {/* ===== MAP ===== */}
          <div className="h-[280px] lg:h-full">
            <iframe
              title="Location"
              className="w-full h-full"
              src="https://www.google.com/maps?q=99,+Block+A,+Defence+Colony,+New+Delhi,+Delhi+110024&output=embed"
            />
          </div>

          {/* ===== FORM ===== */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">

            {/* NAME + EMAIL */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" />
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" />
            </div>

            {/* COMPANY */}
            <Input name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" />

            {/* MOBILE */}
            <Input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" />

            {/* MESSAGE */}
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              className="input"
            />

            {/* CONSENT */}
            <div className="flex items-start gap-2 text-xs text-zinc-500">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="mt-1"
              />
              <p>I agree to receive communication from <b>InOptics</b></p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold transition"
            >
              {loading ? "Sending..." : <>Send Message <FiSend /></>}
            </button>

            {/* STATUS */}
            {successMessage && (
              <p className="text-green-600 text-sm">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

          </form>
        </div>

        {/* ===== INFO CARDS ===== */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">

          <InfoCard icon={<FiMail />} label="Email address">
            <span ref={contactEmailRef}>support@inoptics.in</span>
          </InfoCard>

          <InfoCard icon={<FiPhone />} label="Phone Number">
            +91 011-41815099
          </InfoCard>

          <InfoCard icon={<FiMapPin />} label="Location">
            A-99, Defence Colony, New Delhi
          </InfoCard>

        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}

/* ===== REUSABLE COMPONENTS ===== */

function Input({ name, value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input"
    />
  );
}

function InfoCard({ icon, label, children }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex items-center gap-3">
      <div className="bg-orange-100 text-orange-500 p-3 rounded-full text-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-semibold">{children}</p>
      </div>
    </div>
  );
}