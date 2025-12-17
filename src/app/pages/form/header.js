"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import styles from "../../style/form.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';


const Header = ({casewithsub,formSelect,onFormChange}) => {

  return (
    <div>
       {/* <Row className={`${styles.titleLabel} ${styles.fontEN} align-items-center` } style={{ color: "black", padding: "5px" }}>
        <Col>องค์การขนส่งมวลชนกรุงเทพ</Col>
        <Col>เขตการเดินรถที่</Col>
       </Row>
        <Row className={`${styles.titleLabel} ${styles.fontEN} align-items-center text-center ` } style={{ color: "black", padding: "5px" }}>
           <Col> แบบฟอร์มบันทึกการเขียนเรื่องร้องเรียน ชมเชย แนะนำบริการ</Col>
       </Row> */}
                <Row className="align-items-center" style={{ color: "black", padding: "5px" }}>
            <Col xs="auto" className={`${styles.titleLabel} ${styles.fontEN}`}>Types<span className="text-danger">*</span> : </Col>
            <Col xs={4}>
              <Form.Select className="form-select-sm" onChange={onFormChange}>
                <option className={styles.titleLabelEn}>Open this select menu</option>
                {casewithsub.data.map((child,index) => (
                  <option key={index} value={child.sTypeId} className={` ${styles.fontEN}`}>{child.en}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          {/* <Row className="align-items-center" style={{ color: "black", padding: "5px" }}>
            <Col xs="auto" className={`${styles.titleLabel} ${styles.fontTH}`}>แจ้งทาง<span className="text-danger">*</span> : </Col>
            <Col xs={4}>
              <Form.Select className="form-select-sm">
                <option className={styles.titleLabelEn}>Open this select menu</option>
                <option value="1" className={` ${styles.fontEN}`}>One</option>
                <option value="2" className={` ${styles.fontEN}`}>Two</option>
                <option value="3" className={` ${styles.fontEN}`}>Three</option>
              </Form.Select>
            </Col>
          </Row> */}
    </div>
  );
}

export default Header