//src\app\pages\modaltest\page.js
"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../style/form.module.css";
import ModalForm from "../form/formEditModal";
import { useSearchParams } from "next/navigation";

import { apiFetch, BASE_URL } from "@/app/lib/apiClient";
import {
  showSuccessSwal,
  showWarningSwal,
  showQuestionSwal,
  handleApiError,
} from "@/app/lib/ErrorSwal";

export default function FormPage() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [caseId, setcaseId] = useState("CASE-001");
  const mobileNo = searchParams.get("mobileNo");
  const method = searchParams.get("method");
  // const username = searchParams.get("username");
  const agentName = searchParams.get("agentName");
  const [formFields, setFormFields] = useState(null);
  const [formResponse, setformResponse] = useState(null);
  const [isDefault, setisDefault] = useState(true);
  const [casewithsub, setcasewithsub] = useState(null);
  const [username, setusername] = useState(searchParams.get("username"));
  const [JsonData, setJsonData] = useState({});
  const [Area, setArea] = useState(null);
  const [formSelect, setformSelect] = useState("");
  const [FormBycaseIdRes, setFormBycaseIdRes] = useState(null);
  const latestCaseIdRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      console.log(mobileNo, method, username, agentName);

      if (isDefault) {
        console.log("default", isDefault);

        await getArea();
        await getDefaultData();

        setisDefault(false);
      }
    };

    init();
  }, []);

  const onFormChange = async (e) => {
    var value = e.target.value;
    setformSelect(value);
    setFormFields(null);
    const token = localStorage.getItem("accessToken");
    try {
      console.log("ส่ง request ไปยัง API:");
      const data = await apiFetch(`${BASE_URL}/forms/casesubtype`, {
        method: "POST",
        body: JSON.stringify({
          caseSubType: value,
        }),
      });

      console.log("✅ API Response:", data);

      setformResponse(data.data);
      setFormFields(data.data.formFieldJson);
    } catch (error) {
      console.error("Login error:", error);
    }

    console.log(e.target.value);
  };

  const onDataChange = (property, value) => {
    console.log(property, value);
    const selectedArea = Area.find((item) => item.id === value);

    console.log(selectedArea);
    setJsonData((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const getDefaultData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found");
      return;
    }
    try {
      console.log("API: casetypes_with_subtype");
      const data = await apiFetch(`${BASE_URL}/casetypes_with_subtype`);

      console.log("✅ API Response:", data);
      setcasewithsub(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const UpdateCase = async () => {
    const token = localStorage.getItem("accessToken");

    if (!username) {
      setusername(localStorage.getItem("username"));
    }
    // const selectedArea = Area.find((item) => item.id === JsonData.Area);
    const selectedArea = Area?.find((item) => item.id === JsonData.Area);

    if (!selectedArea) {
      showWarningSwal("กรุณาเลือกพื้นที่");
      return;
    }

    const result = await showQuestionSwal({
      title: "อัพเดทเหตุ?",
    });

    if (!result.isConfirmed) return;

    try {
      let formData = { ...formResponse };
      let json = { ...FormBycaseIdRes };

      ((json.countryId = selectedArea.countryId),
        (json.distId = selectedArea.distId),
        (json.formData = formData),
        (json.provId = selectedArea.provId),
        (json.source = JsonData?.method || "1"),
        console.log("REQUEST JSON:", json));

      const data = await apiFetch(`${BASE_URL}/case/${caseId}`, {
        method: "PATCH",
        body: JSON.stringify(json),
      });
      console.log("✅ API Response:", data);

      showSuccessSwal("บันทึกสำเร็จ");

      setShow(false);
      setFormFields(null);
      setformResponse(null);
      setisDefault(true);
      setJsonData({});
      setformSelect("");
      // setcasewithsub(null)
      // setArea(null)
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const getFormBycaseId = async (caseId) => {
    latestCaseIdRef.current = caseId;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found");
      return;
    }
    try {
      console.log("API: getFormBycaseId");
      const data = await apiFetch(`${BASE_URL}/dispatch/${caseId}/SOP`);
      if (!data) {
        console.log("ไม่มี form สำหรับ case นี้");
        return;
      }
      
      console.log("✅ API Response:", data);
      const formData = data.data.formData || data.data.formAnswer || {};

      setformResponse(formData);
      setFormFields(formData.formFieldJson || []);
      setFormBycaseIdRes(data.data);

      const selectedArea = Area?.find(
        (item) =>
          String(item.countryId) === String(data.data.countryId) &&
          String(item.provId) === String(data.data.provId) &&
          String(item.distId) === String(data.data.distId),
      );

      setJsonData({
        Area: selectedArea?.id || "",
        method: String(data.data.source || "1"),
      });

      setformSelect(data.data.caseSTypeId || "");
    } catch (error) {
      console.error(error);
    }
  };

  const getArea = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found");
      return;
    }
    try {
      console.log("API: GetArea");
      const data = await apiFetch(
        `${BASE_URL}/area/country_province_districts`,
      );

      console.log("✅ API Response:", data);
      setArea(data.data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleClose = () => {
    setShow(false);
    setcaseId(null);
  };

  const handleShow = async (caseId) => {
    console.log("OPEN CASE:", caseId);

    // reset ก่อน
    setFormFields(null);
    setformResponse(null);
    setFormBycaseIdRes(null);
    setJsonData({});
    setformSelect("");

    setcaseId(caseId);
    // setformSelect(caseId);
    await getFormBycaseId(caseId);
    setShow(true);
  };

  if (isDefault) return null;
  return (
    <div className={styles.homepage}>
      <Navbar />
      {formFields != null && (
        <ModalForm
          formFieldJson={formFields}
          setFormFields={setFormFields}
          handleClose={handleClose}
          show={show}
          caseId={caseId}
          UpdateCase={UpdateCase}
          casewithsub={casewithsub}
          formSelect={formSelect}
          onFormChange={onFormChange}
          onDataChange={onDataChange}
          JsonData={JsonData}
          Area={Area}
          update={true}
        />
      )}
    </div>
  );
}
