"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../style/form.module.css";
import Container from "react-bootstrap/Container";
import Swal from "sweetalert2";
import Button from "react-bootstrap/Button";
import ModalForm from "../form/formEditModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";


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
    const [isPrint, setisPrint] = useState(false);
    const [casewithsub, setcasewithsub] = useState(null);
    const [isEdit, setisEdit] = useState(false);
    const [username, setusername] = useState(searchParams.get("username"));
    const [JsonData, setJsonData] = useState({});
    const [Area, setArea] = useState(null);
    const [formSelect, setformSelect] = useState("");
    const printRef = useRef(null);

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
        const selectedArea = Area.find(
            item => item.id === value
        );

        console.log(selectedArea)
        setJsonData(prev => ({
            ...prev,
            [property]: value,
        }));
    };

    const getDefaultData = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            console.error("No access token found");
            return;
        }
        try {
            console.log("API: casetypes_with_subtype");
            const response = await fetch(
                "https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes_with_subtype",
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
                setcasewithsub(data);
            }
        } catch (error) {
            console.error("Login error:", error);

        }
    };

    const UpdateCase = async () => {
        const token = localStorage.getItem("access_token");
        if (username != null || username != "") {
            setusername(localStorage.getItem("username"))
        }
        const selectedArea = Area.find(
            item => item.id === JsonData.Area
        );
        Swal.fire({
            html: `<span class="${styles.fontTH}">อัพเดทเหตุ?</span>`,
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
                        attachments: [],
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
                        countryId: selectedArea.countryId,
                        createdDate: new Date().toISOString(),
                        deviceId: "",
                        distId: selectedArea.distId,
                        extReceive: "",
                        formData: formData,
                        nodeId: formData.nextNodeId,
                        phoneNo: "",
                        phoneNoHide: true,
                        priority: 0,
                        provId: selectedArea.provId,
                        receivedDate: null,
                        referCaseId: "",
                        resDetail: "",
                        resId: null,
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

    const getFormBycaseId = async (caseId) => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            console.error("No access token found");
            return;
        }
        try {
            console.log("API: getFormBycaseId");
            const response = await fetch(
                `https://welcome-service-stg.metthier.ai:65000/api/v1/dispatch/${caseId}/SOP`,
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
                setFormFields(data.data.formAnswer.formFieldJson);
                const selectedArea = Area.find(
                    item =>
                        item.countryId === data.data.countryId &&
                        item.distId === data.data.distId &&
                        item.provId === data.data.provId
                );
                setJsonData({
                    "Area": selectedArea.id,
                    "method": data.data.source

                })
                setformSelect(data.data.caseSTypeId)
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
            console.log("API: GetArea");
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
                setArea(data.data);
            }


        } catch (error) {
            console.error("Login error:", error);

        }
    };


    const handleClose = () => {
        setShow(false)
        setcaseId(null)
    };

    const handleShow = async (caseId) => {
        setcaseId(caseId)
        setformSelect(caseId)
        await getFormBycaseId(caseId)
        setShow(true)
    };

    if (isDefault) return null;
    return (
        <div className={styles.homepage} >
            <Navbar />
            {formFields != null &&
                <ModalForm
                    formFieldJson={formFields}
                    setisEdit={setisEdit}
                    setFormFields={setFormFields}
                    isPrint={isPrint}
                    handleClose={handleClose}
                    show={show}
                    caseId={caseId}
                    UpdateCase={UpdateCase}
                    casewithsub={casewithsub} formSelect={formSelect} onFormChange={onFormChange}
                    onDataChange={onDataChange} JsonData={JsonData} Area={Area}
                    update={true}
                />}
            <Container fluid className="d-flex justify-content-center">
                <Button onClick={() => handleShow("D251218-00001")} variant="secondary" className="mt-2 me-2">Update Case001</Button>
            </Container>
        </div>
    );
}
