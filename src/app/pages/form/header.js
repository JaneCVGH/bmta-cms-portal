//src\app\pages\form\header.js
"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import styles from "../../style/form.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
const contactList = [
  {
    value: "1",
    label: "Call",
  },
];

const Header = ({
  casewithsub,
  JsonData,
  onFormChange,
  onDataChange,
  Area,
  update,
  formSelect,
  isPrint,
  viewMode,
}) => {
  // พื้นที่รับผิดชอบเป็นภาษาไทย
  const ReturnLabel = (e) => {
    const selectedArea = Area.find((item) => item.id === e);
    if (!selectedArea) return "";

    return `${selectedArea.countryTh} ${selectedArea.provinceTh} 
	${selectedArea.districtTh}`;
  };

  // ประเภทคำร้องเป็นภาษาไทย
  const ReturnLabelSubtype = (e) => {
    if (!e || !casewithsub?.data) return "-";

    const selected = casewithsub.data.find(
      (item) => String(item.sTypeId) === String(e),
    );

    console.log("DEBUG subtype:", e, selected);

    if (!selected) return "-";

    return selected.th || "-";
  };

  console.log("formSelect:", formSelect);
  console.log("casewithsub:", casewithsub);

  // dropdown เลือกประเภทคำร้อง
  const uniqueTypes = [
    ...new Map(
      (casewithsub?.data || []).map((item) => [item.typeId, item]),
    ).values(),
  ].sort((a, b) =>
    (a.th || a.subTypeTh || "").localeCompare(
      b.th || b.subTypeTh || "",
      "th", // 👈 รองรับภาษาไทย
    ),
  );

  const ReturnLabelContact = (e) => {
    if (!e) return "-";

    const selected = contactList.find(
      (item) => String(item.value) === String(e),
    );

    return selected?.label || "-";
  };

  if (casewithsub == null || Area == null) return null;

  return (
    <div>
      <Row className="align-items-center mb-2">
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontEN}`}>
          ประเภทคำร้อง <span className="text-danger">*</span> :{" "}
        </Col>
        <Col xs={4}>
          {isPrint ? (
            ReturnLabelSubtype(formSelect)
          ) : (
            <Form.Select
              className="form-select-sm"
              value={formSelect}
              onChange={onFormChange}
              disabled={update}
            >
              <option className={styles.titleLabelEn} value="">เลือกประเภทคำร้อง</option>
              {/* {casewithsub.data.map((child, index) => ( */}
              {uniqueTypes.map((child, index) => (
                <option
                  key={index}
                  value={child.sTypeId}
                  className={` ${styles.fontTH}`}
                >
                  {child.th}
                </option>
              ))}
            </Form.Select>
          )}
        </Col>
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>
          แจ้งช่องทาง<span className="text-danger">*</span> :{" "}
        </Col>
        <Col xs={4}>
          {isPrint ? (
            ReturnLabelContact(JsonData.method)
          ) : (
            <Form.Select
              className="form-select-sm"
              // value={viewMode || update ? "1" : JsonData.method || ""}
              value={JsonData.method || ""}
              disabled={viewMode}
              onChange={(e) => onDataChange("method", e.target.value)}
            >
              <option className={styles.titleLabelEn}>เลือกแจ้งช่องทาง</option>
              {contactList.map((child, index) => (
                <option
                  key={index}
                  value={child.value}
                  className={` ${styles.fontEN}`}
                >
                  {child.label}
                </option>
              ))}
            </Form.Select>
          )}
        </Col>
      </Row>
      {Area && (
        <Row className="align-items-center mb-2">
          <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>
            พื้นที่รับผิดชอบ <span className="text-danger">*</span> :{" "}
          </Col>
          <Col xs={6}>
            {isPrint ? (
              ReturnLabel(JsonData.Area)
            ) : (
              <Form.Select
                className="form-select-sm"
                value={JsonData.Area}
                disabled={viewMode}
                onChange={(e) => {
                  onDataChange("Area", e.target.value);
                }}
              >
                <option className={styles.titleLabelEn}>
                  เลือกพื้นที่รับผิดชอบ
                </option>
                {Area &&
                  Area.map((child, index) => (
                    <option
                      key={index}
                      value={child.id}
                      className={` ${styles.fontTH}`}
                    >
                      {`${child.countryTh} ${child.provinceTh} ${child.districtTh}`}
                    </option>
                  ))}
              </Form.Select>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Header;