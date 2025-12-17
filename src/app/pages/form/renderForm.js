import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styles from "../../style/form.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
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
    className={`${styles.titleLabel} ${styles.fontTH}`}
    style={{
      minHeight: "20px",
      padding: "2px 4px",
      maxWidth,
      whiteSpace: "pre-wrap",
    }}
  >
    {value || " "}
  </div>
);


const DynamicFormRenderer = ({ formFieldJson, onChange,isPrint }) => {
  return (
    <div style={{ padding:"5px"}}>
      {/* <Row className="g-3" style={{ background}}> */}
        {formFieldJson.map((field) =>
           renderField(field, onChange, isPrint)
        )}
      {/* </Row> */}
    </div>
  );
};

export default DynamicFormRenderer;

