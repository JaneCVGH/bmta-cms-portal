import { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Header from "./header";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import RenderForm from "./renderForm";

const DynamicFormRenderer = ({ formFieldJson, setFormFields, handleClose, show, caseId,
    casewithsub, JsonData, onFormChange, onDataChange, Area, formSelect, UpdateCase
}) => {
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
    const [isPrint, setisPrint] = useState(false);
    const [isEdit, setisEdit] = useState(false);
    const printRef = useRef(null);

    console.log(formFieldJson)
    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{caseId}</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <div className="mb-2">
                    <Button onClick={downloadPDF} disabled={!isEdit} className="mt-2 me-2">Save PDF</Button>
                    <Button onClick={UpdateCase} disabled={!isEdit} variant="warning" className="mt-2 me-2">Update Case</Button></div>
                <Header casewithsub={casewithsub} formSelect={formSelect} onFormChange={onFormChange}
                    onDataChange={onDataChange} JsonData={JsonData} Area={Area} update={true} isPrint={isPrint}
                />
                <div ref={printRef} style={{
                    width: "210mm", minHeight: "297mm", padding: "20mm"
                }}>


                    {formFieldJson != null &&
                        (<RenderForm
                            formFieldJson={formFieldJson}
                            setisEdit={setisEdit}
                            setFormFields={setFormFields}
                            isPrint={isPrint}
                        />)
                    }
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>

    );
};

export default DynamicFormRenderer;

