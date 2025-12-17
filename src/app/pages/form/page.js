"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../style/form.module.css";
import Container from "react-bootstrap/Container";
import Swal from "sweetalert2";
import Button from "react-bootstrap/Button";
import DynamicFormRenderer from "./renderForm";
import Header from "./header";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";


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
  const [Area, setArea] = useState(false);
  const [country, setcountry] = useState(null);
  const [province, setprovince] = useState(null);
  const [districts, setdistricts] = useState(null);
  const [formSelect, setformSelect] = useState("");
  const printRef = useRef(null);

  useEffect(() => {

    console.log(mobileNo, method, username, agentName)
    if (isDefault) {
      console.log("default", isDefault)
      getDefaultData();
      getArea()
      setisDefault(false);
    }
  }, []);

  const onFormChange = async (e) => {
    var value = e.target.value
    setformSelect(value)
    setFormFields(null);
    const token = localStorage.getItem("access_token");
    try {
      console.log("ส่ง request ไปยัง API:");
      const response = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/forms/casesubtype",
        // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ correct
          },
          body: JSON.stringify({
            "caseSubType": value
          }),
        }
      );

      // console.log("Response status:", response.status);
      const data = await response.json();
      console.log("✅ API Response:", data);
      // console.log("Response data:", data);
      if (response.ok) {
        setformResponse(data.data)
        setFormFields(data.data.formFieldJson);
      }
    } catch (error) {
      console.error("Login error:", error);

    }

    console.log(e.target.value)
  }

  const onDataChange = (property, value) => {
    console.log(property, value)
    setJsonData(prev => ({
      ...prev,
      [property]: value,
    }));
  };


  const CreateCase = async () => {
    const token = localStorage.getItem("access_token");
    if (username != null || username != "") {
      setusername(localStorage.getItem("username"))
    }

    Swal.fire({
      html: `<span class="${styles.fontTH}">เปิดเหตุ?</span>`,
      // text: "You won't be able to revert this!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `<span class="${styles.fontTH}">ยืนยัน</span>`,
      cancelButtonText: `<span class="${styles.fontTH}">ยกเลิก</span>`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let formData = { ...formResponse };
          formData.formFieldJson = formFields;

          const item = casewithsub?.data?.find(
            (c) => c.sTypeId === formSelect
          );

          const json = {
            arrivedDate: null,
            assignUser: "",
            attachments: [
              {
                attId: "",
                attName: "",
                attUrl: "",
                type: "",
              },
            ],
            caseDetail: "",
            caseDuration: 0,
            caseId: "",
            caseLat: "",
            caseLocAddr: "",
            caseLocAddrDecs: "",
            caseLon: "",
            caseSTypeId: formSelect,
            caseTypeId: item?.typeId,
            caseVersion: "publish",
            closedDate: null,
            commandedDate: null,
            countryId: JsonData.country,
            createdDate: new Date().toISOString(),
            deviceId: "",
            distId: JsonData.districts,
            extReceive: "",
            formData: formData,
            nodeId: formData.nextNodeId,
            phoneNo: "",
            phoneNoHide: true,
            priority: 0,
            provId: JsonData.province,
            receivedDate: null,
            referCaseId: "",
            resDetail: "",
            resId: "",
            scheduleDate: null,
            scheduleFlag: false,
            source: JsonData.method,
            startedDate: new Date().toISOString(),
            statusId: "S001",
            userarrive: "",
            userclose: "",
            usercommand: "",
            usercreate: username,
            userreceive: "",
            versions: formData.versions,
            wfId: formData.wfId,
          };

          console.log("REQUEST JSON:", json);

          const response = await fetch(
            "https://welcome-service-stg.metthier.ai:65000/api/v1/case/add",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(json),
            }
          );

          const data = await response.json();
          console.log("✅ API Response:", data);

          if (response.ok) {
            Swal.fire({
              title: "Success",
              icon: "success",
              draggable: true,
            });
          }
        } catch (error) {
          console.error("API error:", error);
        }
      }
    });




  }
  const updateFieldValue = (fields, id, value) => {
    return fields.map((field) => {
      // normal field
      if (field.id === id) {
        return { ...field, value };
      }

      // InputGroup (children)
      if (field.type === "InputGroup" && Array.isArray(field.value)) {
        return {
          ...field,
          value: field.value.map((child) =>
            child.id === id ? { ...child, value } : child
          ),
        };
      }

      return field;
    });
  };

  const handleChange = useCallback((id, value) => {
    setisEdit(true)
    setFormFields((prev) =>
      updateFieldValue(prev, id, value)
    );
  }, []);

  const downloadPDF = async () => {
    setisPrint(true);

    // ⏳ wait for React to re-render
    setTimeout(async () => {
      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("BMTA-Form.pdf");

      setisPrint(false);
    }, 300); // 200–300ms is ideal
  };


  const getDefaultData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found");
      return;
    }
    try {
      console.log("ส่ง request ไปยัง API:");
      const response = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes_with_subtype",
        // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ correct
          },
          // body: JSON.stringify({
          //   username,
          //   password,
          //   organization,
          // }),
        }
      );

      const data = await response.json();
      console.log("✅ API Response:", data);
      if (response.ok) {
        setcasewithsub(data);
      }
    } catch (error) {
      console.error("Login error:", error);

    }
  };

  const getArea = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found");
      return;
    }
    try {
      const response = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/area/country_province_districts",
        // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ correct
          },
        }
      );

      const data = await response.json();
      console.log("✅ API Response:", data);
      if (response.ok) {
        const {
          countries,
          provincesByCountry,
          districtsByProvince,
        } = transformLocationData(data.data);
        setcountry(countries)
        setprovince(provincesByCountry)
        setdistricts(districtsByProvince)
        setArea(true)
      }


    } catch (error) {
      console.error("Login error:", error);

    }
  };

  function transformLocationData(data) {
    const countries = {};
    const provincesByCountry = {};
    const districtsByProvince = {};

    data.forEach((item) => {
      const {
        countryId,
        countryEn,
        countryTh,
        provId,
        provinceEn,
        provinceTh,
        distId,
        districtEn,
        districtTh,
      } = item;

      // 1️⃣ Countries
      if (!countries[countryId]) {
        countries[countryId] = {
          countryId,
          countryEn,
          countryTh,
        };
      }

      // 2️⃣ Provinces by country
      if (!provincesByCountry[countryId]) {
        provincesByCountry[countryId] = {};
      }

      if (!provincesByCountry[countryId][provId]) {
        provincesByCountry[countryId][provId] = {
          provId,
          provinceEn,
          provinceTh,
        };
      }

      // 3️⃣ Districts by province
      if (!districtsByProvince[provId]) {
        districtsByProvince[provId] = {};
      }

      if (!districtsByProvince[provId][distId]) {
        districtsByProvince[provId][distId] = {
          distId,
          districtEn,
          districtTh,
        };
      }
    });

    return {
      countries: Object.values(countries),
      provincesByCountry: Object.fromEntries(
        Object.entries(provincesByCountry).map(([k, v]) => [
          k,
          Object.values(v),
        ])
      ),
      districtsByProvince: Object.fromEntries(
        Object.entries(districtsByProvince).map(([k, v]) => [
          k,
          Object.values(v),
        ])
      ),
    };
  }


  if (isDefault && country == null && province == null && districts == null) return null;
  return (
    <div className={styles.homepage} >
      <Navbar />
      <Container fluid className="d-flex justify-content-center">
        <div >
          <div>
            <Button onClick={downloadPDF} disabled={!isEdit} className="mt-2 me-2">Save PDF</Button>
            <Button onClick={CreateCase} disabled={!isEdit} variant="secondary" className="mt-2 me-2">Create Case</Button>
            <Header casewithsub={casewithsub} formSelect={formSelect} onFormChange={onFormChange}
              onDataChange={onDataChange} JsonData={JsonData} Area={Area}
              countries={country} provincesByCountry={province} districtsByProvince={districts}

            />

          </div>
          <div ref={printRef} style={{
            width: "210mm", minHeight: "297mm", padding: "20mm", background: "#fff",
          }}>
            {formFields != null &&
              <DynamicFormRenderer
                formFieldJson={formFields}
                onChange={handleChange}
                isPrint={isPrint}
              />}</div>
        </div>

      </Container>
    </div>

  );
}
