"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../style/form.module.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DynamicFormRenderer from "./renderForm";
import Header from "./header";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// const formJson = {
//   "status": "0",
//   "msg": "Success",
//   "data": {
//     "nextNodeId": "node-1734093600002",
//     "versions": "draft",
//     "wfId": "5267551c-bf68-4d9d-8ad1-2ae8e04684b2",
//     "formId": "17d235f0-6773-45e0-9418-2c41c9e81ae8",
//     "formName": "BMTA Form",
//     "formColSpan": 1,
//     "formFieldJson": [
//       {
//         "id": "445e4874-5da0-462c-af59-8747686440f9",
//         "label": "องค์การขนส่งมวลชนกรุงเทพ",
//         "showLabel": true,
//         "type": "InputGroup",
//         "value": [
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "2f1870b3-50bd-467c-9064-d504462b5d70",
//             "isChild": true,
//             "label": "เขตการเดินรถที่",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "enableSearch": false,
//             "formRule": {},
//             "id": "0b977d50-a111-43a3-85d3-150a662ecb12",
//             "isChild": true,
//             "label": "Single-Select",
//             "newOptionText": "",
//             "options": [
//               "สนญ."
//             ],
//             "placeholder": "",
//             "required": false,
//             "showLabel": false,
//             "type": "select",
//             "value": "สนญ."
//           }
//         ],
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "GroupColSpan": 2,
//         "formRule": {}
//       },
//       {
//         "id": "6aa02806-f774-4c94-88e5-adda14f97cbb",
//         "label": "แบบฟอร์มบันทึกการเขียนเรื่องร้องเรียน ชมเชย แนะน่าบริการ",
//         "showLabel": true,
//         "type": "InputGroup",
//         "value": [
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "9ba5fe21-1cf5-4aa3-a14f-b88a43d39d3a",
//             "isChild": true,
//             "label": "ที่(หน่วยงาน) บผ.",
//             "placeholder": "{caseId}",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "enableSearch": false,
//             "formRule": {},
//             "id": "7ff39a01-145f-47d7-8daa-eb7ac6cc3f37",
//             "isChild": true,
//             "label": "แจ้งโดย",
//             "newOptionText": "",
//             "options": [
//               "โทรศัพท์"
//             ],
//             "required": false,
//             "showLabel": true,
//             "type": "select",
//             "value": ""
//           }
//         ],
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "GroupColSpan": 1,
//         "formRule": {}
//       },
//       {
//         "id": "80da9298-2a92-4b86-af3a-99a8431cb9da",
//         "label": "เรียน ผอ.ขตร.",
//         "showLabel": true,
//         "type": "textInput",
//         "value": "",
//         "required": true,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "0b09571c-322c-4228-bcba-4174661e2920",
//         "label": "เหตุเกิดวันที่",
//         "showLabel": true,
//         "type": "textInput",
//         "value": "",
//         "required": true,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "37ff4e41-ae75-4ff5-9dcc-faae64f452f4",
//         "label": "สถานที่เกิดเหตุ",
//         "showLabel": true,
//         "type": "textAreaInput",
//         "value": "",
//         "required": true,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "c6179e47-8556-4b85-bd57-a3d810b1b2e1",
//         "label": "ประเภทรถ",
//         "showLabel": true,
//         "type": "select",
//         "value": "รถธรรมดา",
//         "enableSearch": false,
//         "options": [
//           "รถธรรมดา",
//           "รถปรับอากาศ"
//         ],
//         "placeholder": "",
//         "required": true,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "ca31d763-854e-44ee-8bd3-073fb4f4f436",
//         "label": "รายละเอียด",
//         "showLabel": true,
//         "type": "InputGroup",
//         "value": [
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "5d7991f3-2d3f-470d-ab5a-476da7dd01af",
//             "isChild": true,
//             "label": "สาย",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "a64112ca-cdff-4d1b-aba0-c05d079f7828",
//             "isChild": true,
//             "label": "เลขข้างรถ",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "3da6342b-6739-4cb8-a0ae-0e215626785f",
//             "isChild": true,
//             "label": "เลขทะเบียน",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           }
//         ],
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "GroupColSpan": 3,
//         "formRule": {}
//       },
//       {
//         "id": "8fb4f3a4-159e-4daf-a370-0fca5781f4a5",
//         "label": "พขร.",
//         "showLabel": true,
//         "type": "textInput",
//         "value": "",
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "d47f4e16-a994-4ef9-914a-f872e5a285bc",
//         "label": "พกส.",
//         "showLabel": true,
//         "type": "textInput",
//         "value": "",
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "7c700453-dbc6-46c4-9576-7a614727c421",
//         "label": "ประเภท",
//         "showLabel": true,
//         "type": "select",
//         "value": "",
//         "enableSearch": false,
//         "options": [
//           "สอบถามเส้นทาง",
//           "ร้องเรียน",
//           "แจ้งของหาย",
//           "สอบถามเรื่องอื่นๆ",
//           "ชมเชย",
//           "แนะนำบริกา"
//         ],
//         "required": true,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "cc05513f-9115-4807-9da1-bf2e30ffa3ff",
//         "label": "รายละเอียด",
//         "showLabel": true,
//         "type": "textAreaInput",
//         "value": "",
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "27f47ddc-f459-4e80-95c2-3c9a16580d4c",
//         "label": "ผู้ร้องแจ้งว่า",
//         "showLabel": true,
//         "type": "textAreaInput",
//         "value": "",
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "667f05aa-56cc-4ebd-ad1c-bb579a8b46db",
//         "label": "รับเรื่องวันที่",
//         "showLabel": true,
//         "type": "dateInput",
//         "value": "",
//         "required": true,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       },
//       {
//         "id": "43fecbf8-ecf9-4427-83fc-e7f286bc3a76",
//         "label": "จึงเรียนมาเพื่อสอบสวนข้อเท็จจริง ผลเป็นประการใดแจ้งให้ทราบภายใน 15 วัน",
//         "showLabel": true,
//         "type": "InputGroup",
//         "value": [
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "2f364487-7357-4313-80d8-1370be102503",
//             "isChild": true,
//             "label": "ผู้แจ้ง",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "43802a75-c130-4326-a42d-043dd542ca28",
//             "isChild": true,
//             "label": "โทรศัพท์",
//             "placeholder": "{mobileNo}",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           }
//         ],
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "GroupColSpan": 2,
//         "formRule": {}
//       },
//       {
//         "id": "af44d097-b5b5-4ac1-b4dc-e4afb59ad9d7",
//         "label": "Group",
//         "showLabel": false,
//         "type": "InputGroup",
//         "value": [
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "755db9a9-efe8-438d-915a-0f74f2352797",
//             "isChild": true,
//             "label": "บ้านเลขที่",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "b64c8785-be5f-48ff-b85d-1913e14750bb",
//             "isChild": true,
//             "label": "หมู่ที่",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "e678ada0-ae85-4309-a398-5ccad6bb452f",
//             "isChild": true,
//             "label": "ตรอก/ซอย",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "88e7e72b-17cb-40a9-9b6e-9e1d103d58e8",
//             "isChild": true,
//             "label": "ถนน",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "7167c317-f851-4db5-a9f9-48a7d0f5837d",
//             "isChild": true,
//             "label": "ตำบล/แขวง",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "e891946b-c07a-48df-95ad-99091a00408c",
//             "isChild": true,
//             "label": "อำเภอ/เขต",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "b37cc4b0-64a2-4a07-ac60-2559f1c63402",
//             "isChild": true,
//             "label": "จังหวัด",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           },
//           {
//             "colSpan": 1,
//             "formRule": {},
//             "id": "e0a89f45-70d3-4f05-bf0c-571237c53afc",
//             "isChild": true,
//             "label": "รหัสไปรษณีย์",
//             "required": false,
//             "showLabel": true,
//             "type": "textInput",
//             "value": ""
//           }
//         ],
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "GroupColSpan": 4,
//         "formRule": {}
//       },
//       {
//         "id": "34e62950-a63a-483b-bf55-e9b03bf2cfb3",
//         "label": "ผู้รับเรื่อง",
//         "showLabel": true,
//         "type": "textInput",
//         "value": "",
//         "placeholder": "{agentName}",
//         "required": false,
//         "colSpan": 1,
//         "isChild": false,
//         "formRule": {}
//       }
//     ]
//   },
//   "desc": ""
// }
export default function FormPage() {

  const [formFields, setFormFields] = useState(null);
  const [isDefault, setisDefault] = useState(true);
    const [isPrint, setisPrint] = useState(false);
  const [casewithsub, setcasewithsub] = useState(null);
  const [formSelect, setformSelect] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    if (isDefault) {
      getDefaultData()
      setisDefault(false)
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
        setFormFields(data.data.formFieldJson);
      }
    } catch (error) {
      console.error("Login error:", error);

    }

    console.log(e.target.value)
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

      // console.log("Response status:", response.status);
      const data = await response.json();
      console.log("✅ API Response:", data);
      // console.log("Response data:", data);
      if (response.ok) {
        setcasewithsub(data);
      }
    } catch (error) {
      console.error("Login error:", error);

    } finally {

    }
  };
  if (!casewithsub) return null;
  return (
    <div className={styles.homepage} >
      <Navbar />
      <Button onClick={downloadPDF}>Save PDF</Button>
      <Header casewithsub={casewithsub} formSelect={formSelect} onFormChange={onFormChange} />
      <Container fluid className="d-flex justify-content-center">
        <div ref={printRef} style={{
          width: "210mm", minHeight: "297mm", padding: "20mm", background: "#fff",
        }}>

          {formFields != null && 
          <DynamicFormRenderer
            formFieldJson={formFields}
            onChange={handleChange}
            isPrint={isPrint}
          />}
        </div>

      </Container>
    </div>

  );
}
