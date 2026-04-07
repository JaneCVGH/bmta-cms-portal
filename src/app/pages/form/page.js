//src\app\pages\form\page.js
"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../style/form.module.css";
import Container from "react-bootstrap/Container";
// import Swal from "sweetalert2";
import Button from "react-bootstrap/Button";
import DynamicFormRenderer from "./renderForm";
import Header from "./header";

import { downloadPDF } from "@/app/utils/pdf";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";
import { BASE_URL, apiFetch, fetchData } from "../../lib/apiClient";

export default function FormPage() {
  const searchParams = useSearchParams();
  const mobileNo = searchParams.get("mobileNo");
  const method = searchParams.get("method");
  // const username = searchParams.get("username");
  const agentName = searchParams.get("agentName");
  const [formFields, setFormFields] = useState(null);
  const [formResponse, setformResponse] = useState(null);
  const [isDefault, setisDefault] = useState(true);
  const [isPrint, setisPrint] = useState(false);
  const [casewithsub, setcasewithsub] = useState(null);
  const [isEdit, setisEdit] = useState(false);
  const [username, setusername] = useState(searchParams.get("username"));
  const [JsonData, setJsonData] = useState({});
  const [Area, setArea] = useState(null);
  const [country, setcountry] = useState(null);
  const [province, setprovince] = useState(null);
  const [districts, setdistricts] = useState(null);
  const [formSelect, setformSelect] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    console.log(mobileNo, method, username, agentName);
    if (isDefault) {
      console.log("default", isDefault);
      getDefaultData();
      getArea();
      setisDefault(false);
    }
  }, []);

  const onFormChange = async (e) => {
    const value = e.target.value;
    setformSelect(value);
    setFormFields(null);

    if (!value || value === "เลือกประเภทคำร้อง") return;

    const data = await apiFetch(`${BASE_URL}/forms/casesubtype`, {
      method: "POST",
      body: JSON.stringify({ caseSubType: value }),
    });

    if (!data) return;
    setformResponse(data.data);
    setFormFields(data.data.formFieldJson);
  };

  const onDataChange = (property, value) => {
    console.log(property, value);
    setJsonData((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    await downloadPDF(printRef.current);
  };

  const getDefaultData = async () => {
    const data = await apiFetch(`${BASE_URL}/casetypes_with_subtype`);
    setcasewithsub(data);
  };

  const getArea = async () => {
    const data = await apiFetch(`${BASE_URL}/area/country_province_districts`);

    setArea(data.data);
  };

  if (isDefault) return null;
  return (
    <div className={styles.homepage}>
      <Navbar />
      <Container fluid className="d-flex justify-content-center">
        <div>
          <div>
            <div className="mb-2">
              <button
                onClick={handleDownloadPDF}
                disabled={!isEdit}
                className={styles.btnSavePDF + " mt-2 me-2"}
              >
                บันทึก PDF
              </button>

              <button
                onClick={CreateCase}
                disabled={!isEdit}
                className={styles.btnCreateCase + " mt-2 me-2"}
              >
                สร้างใบสั่งาน
              </button>
            </div>
            <Header
              casewithsub={casewithsub}
              formSelect={formSelect}
              onFormChange={onFormChange}
              onDataChange={onDataChange}
              JsonData={JsonData}
              Area={Area}
              countries={country}
              provincesByCountry={province}
              districtsByProvince={districts}
            />
          </div>
          <div ref={printRef} className={styles.a4Paper}>
            {formFields != null && (
              <DynamicFormRenderer
                formFieldJson={formFields}
                setisEdit={setisEdit}
                setFormFields={setFormFields}
                isPrint={isPrint}
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
