import { useCallback } from "react";
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
      // minHeight: "20px",
      // padding: "2px 4px",
      maxWidth,
      whiteSpace: "pre-wrap",
    }}
  >
    {value || " "}
  </div>
);


const DynamicFormRenderer = ({ formFieldJson, setisEdit,setFormFields,isPrint }) => {

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
    <div style={{ padding:"5px"}}>
        {formFieldJson.map((field) =>
           renderField(field, handleChange, isPrint)
        )}

    </div>
  );
};

export default DynamicFormRenderer;

