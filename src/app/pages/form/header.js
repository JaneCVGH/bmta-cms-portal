"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import styles from "../../style/form.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
const contactList = [{
  "value": "1",
  "label": "Call"
}]

const Header = ({ casewithsub, JsonData, onFormChange, onDataChange, Area, update, formSelect, isPrint }) => {
  const ReturnLabel = (e) => {
    const selectedArea = Area.find(
      item => item.id === e
    )


    return `${selectedArea.countryEn} ${selectedArea.provinceEn} ${selectedArea.districtEn}`
  }

  const ReturnLabelSubtype = (e) => {
    const selectedArea = casewithsub.data.find(
      item => item.sTypeId === e
    )


    return `${selectedArea.en}`
  }

  const ReturnLabelContact = (e) => {
    const selectedArea = contactList.find(
      item => item.value === e
    )


    return `${selectedArea.label}`
  }


  if (casewithsub == null || Area == null) return null

  return (
    <div>
      <Row className="align-items-center mb-2">
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontEN}`}>Types<span className="text-danger">*</span> : </Col>
        <Col xs={4}>
          {isPrint ? (ReturnLabelSubtype(formSelect)) :
            (<Form.Select className="form-select-sm" value={formSelect} onChange={onFormChange} disabled={update}>
              <option className={styles.titleLabelEn}>Select</option>
              {casewithsub.data.map((child, index) => (
                <option key={index} value={child.sTypeId} className={` ${styles.fontEN}`}>{child.en}</option>
              ))}

            </Form.Select>)}
        </Col>
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>แจ้งทาง<span className="text-danger">*</span> : </Col>
        <Col xs={4}>
          {isPrint ? (ReturnLabelContact(JsonData.method)) :
            (<Form.Select className="form-select-sm" value={JsonData.method} onChange={e => onDataChange("method", e.target.value)}>
              <option className={styles.titleLabelEn}>Select</option>
              {contactList.map((child, index) => (
                <option key={index} value={child.value} className={` ${styles.fontEN}`}>{child.label}</option>
              ))}
            </Form.Select>)}
        </Col>
      </Row>
      {Area && <Row className="align-items-center mb-2" >
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>Service Center<span className="text-danger">*</span> : </Col>
        <Col xs={6}>
          {isPrint ? (ReturnLabel(JsonData.Area)) :
            (<Form.Select className="form-select-sm" value={JsonData.Area}
              onChange={(e) => {
                onDataChange("Area", e.target.value)
              }}>
              <option className={styles.titleLabelEn}>Select</option>
              {Area && Area.map((child, index) => (
                <option key={index} value={child.id} className={` ${styles.fontEN}`}>{`${child.countryEn} ${child.provinceEn} ${child.districtEn}`}</option>
              ))}
            </Form.Select>)}
        </Col>
      </Row>}

    </div>
  );
}

export default Header