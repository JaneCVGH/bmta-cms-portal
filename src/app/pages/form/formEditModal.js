import { useCallback, useState, useRef, useEffect } from "react";
import styles from "../../style/form.module.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Header from "./header";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const renderField = (field, onChange, isPrint) => {
    // ===== NORMAL FIELD =====
    if (field.type !== "InputGroup") {
        return (
            <Row key={field.id}>
                {field.showLabel && (
                    <Col md={3}>
                        <Form.Label className={`${styles.titleLabel} ${styles.fontTH}`}>
                            {field.label}
                        </Form.Label>
                    </Col>
                )}

                <Col>
                    {/* TEXT INPUT */}
                    {field.type === "textInput" &&
                        (isPrint ? (
                            printText(field.value)
                        ) : (
                            <Form.Control
                                className={`${styles.titleLabel} ${styles.fontTH} form-control-sm mb-2`}
                                value={field.value}
                                onChange={(e) => onChange(field.id, e.target.value)}
                            />
                        ))}

                    {/* TEXT AREA */}
                    {field.type === "textAreaInput" &&
                        (isPrint ? (
                            printText(field.value)
                        ) : (
                            <Form.Control
                                as="textarea"
                                className={`${styles.titleLabel} ${styles.fontTH} form-control-sm mb-2`}
                                value={field.value}
                                onChange={(e) => onChange(field.id, e.target.value)}
                            />
                        ))}

                    {/* SELECT */}
                    {field.type === "select" &&
                        (isPrint ? (
                            printText(field.value)
                        ) : (
                            <Form.Select
                                className={`${styles.titleLabel} ${styles.fontTH} form-select-sm mb-2`}
                                value={field.value}
                                onChange={(e) => onChange(field.id, e.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </Form.Select>
                        ))}

                    {/* DATE */}
                    {field.type === "dateInput" &&
                        (isPrint ? (
                            printText(field.value)
                        ) : (
                            <Form.Control
                                type="date"
                                className={`${styles.titleLabel} ${styles.fontEN} form-control-sm mb-2`}
                                value={field.value}
                                onChange={(e) => onChange(field.id, e.target.value)}
                            />
                        ))}
                </Col>
            </Row>
        );
    }

    // ===== INPUT GROUP =====
    const colSize = 12 / (field.GroupColSpan || 1);

    return (
        <Row key={field.id}>
            {field.showLabel && (
                <Form.Label className={`${styles.titleLabel} ${styles.fontTH}`}>
                    {field.label}
                </Form.Label>
            )}

            {field.value.map((child) => (
                <Col
                    key={child.id}
                    xs={colSize}
                    md={colSize}
                    className="d-flex align-items-center gap-2"
                >
                    {child.showLabel && (
                        <Form.Label className={`${styles.titleLabel} ${styles.fontTH}`}>
                            {child.label}
                        </Form.Label>
                    )}

                    {isPrint ? (
                        printText(child.value, "150px")
                    ) : (
                        <Form.Control
                            className={`${styles.titleLabel} ${styles.fontTH} form-control-sm mb-2`}
                            value={child.value}
                            onChange={(e) => onChange(child.id, e.target.value)}
                            style={{ maxWidth: "150px" }}
                        />
                    )}
                </Col>
            ))}
        </Row>
    );
};


const printText = (value, maxWidth) => (
    <div
        className={`${styles.titleLabel} ${styles.fontTH} form-control-sm mb-2`}
        style={{
            // minHeight: "20px",
            padding: "2px 4px",
            maxWidth,
            whiteSpace: "pre-wrap",
        }}
    >
        {value || " "}
    </div>
);


const DynamicFormRenderer = ({ formFieldJson, setFormFields, handleClose, show, caseId,
    casewithsub, JsonData, onFormChange, onDataChange, Area, formSelect, update, UpdateCase
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
    const handleChange = useCallback((id, value) => {
        setisEdit(true)
        setFormFields((prev) =>
            updateFieldValue(prev, id, value)
        );
    }, []);

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

    return (
        <Modal show={show} onHide={handleClose} size="lg" style={{ width:"100%"}}>
            <Modal.Header closeButton>
                <Modal.Title>{caseId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Button onClick={downloadPDF} disabled={!isEdit} className="mt-2 me-2">Save PDF</Button>
                <Button onClick={UpdateCase} disabled={!isEdit} variant="warning" className="mt-2 me-2">Create Case</Button>
                          <div ref={printRef} style={{
            width: "210mm", minHeight: "297mm", padding: "20mm",
          }}>
                    <Header casewithsub={casewithsub} formSelect={formSelect} onFormChange={onFormChange}
                        onDataChange={onDataChange} JsonData={JsonData} Area={Area} update={true} isPrint={isPrint}
                    />

                    {formFieldJson.map((field) =>
                        renderField(field, handleChange, isPrint)
                    )}</div>
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

