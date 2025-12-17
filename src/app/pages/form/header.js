"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import styles from "../../style/form.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';


const Header = ({ casewithsub, JsonData, onFormChange, onDataChange, countries, provincesByCountry, districtsByProvince,Area }) => {

  if (casewithsub == null) return null

  return (
    <div>
      <Row className="align-items-center" style={{ color: "black", padding: "5px" }}>
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontEN}`}>Types<span className="text-danger">*</span> : </Col>
        <Col xs={4}>
          <Form.Select className="form-select-sm" onChange={onFormChange}>
            <option className={styles.titleLabelEn}>Open this select menu</option>
            {casewithsub.data.map((child, index) => (
              <option key={index} value={child.sTypeId} className={` ${styles.fontEN}`}>{child.en}</option>
            ))}

          </Form.Select>
        </Col>
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>แจ้งทาง<span className="text-danger">*</span> : </Col>
        <Col xs={4}>
          <Form.Select className="form-select-sm" value={JsonData.method} onChange={e => onDataChange("method", e.target.value)}>
            <option className={styles.titleLabelEn}>Open this select menu</option>
            <option value="1" className={` ${styles.fontEN}`}>Call</option>
          </Form.Select>
        </Col>
      </Row>
      <Row className="align-items-center" style={{ color: "black", padding: "5px" }} value={JsonData.center} onChange={e => onDataChange("center", e.target.value)}>
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>Service Center<span className="text-danger">*</span> : </Col>
        <Col xs={4}>
          <Form.Select className="form-select-sm">
            <option className={styles.titleLabelEn}>Open this select menu</option>
            <option value="1" className={` ${styles.fontEN}`}>One</option>
            <option value="2" className={` ${styles.fontEN}`}>Two</option>
            <option value="3" className={` ${styles.fontEN}`}>Three</option>
          </Form.Select>
        </Col>
      </Row>
      {Area && <Row className="align-items-center" style={{ color: "black", padding: "5px" }} >
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>Country<span className="text-danger">*</span> : </Col>
        <Col xs={2}>
          <Form.Select className="form-select-sm" value={JsonData.country} onChange={e => onDataChange("country", e.target.value)}>
            <option className={styles.titleLabelEn}>Open this select menu</option>
            {countries.map((child, index) => (
              <option key={index} value={child.countryId} className={` ${styles.fontEN}`}>{child.countryEn}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>Province<span className="text-danger">*</span> : </Col>
        <Col xs={2}>
          <Form.Select className="form-select-sm"
            value={JsonData.province} onChange={e => onDataChange("province", e.target.value)}
          >
            <option className={styles.titleLabelEn}>Open this select menu</option>
            {provincesByCountry[JsonData.country] && provincesByCountry[JsonData.country].map((child, index) => (
              <option key={index} value={child.provId} className={` ${styles.fontEN}`}>{child.provinceEn}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>Districts<span className="text-danger">*</span> : </Col>
        <Col xs={2}>
          <Form.Select className="form-select-sm"
            value={JsonData.districts} onChange={e => onDataChange("districts", e.target.value)}>

            <option className={styles.titleLabelEn}>Open this select menu</option>
            {districtsByProvince[JsonData.province] && districtsByProvince[JsonData.province].map((child, index) => (
              <option key={index} value={child.distId} className={` ${styles.fontEN}`}>{child.districtEn}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>}
      
    </div>
  );
}

export default Header