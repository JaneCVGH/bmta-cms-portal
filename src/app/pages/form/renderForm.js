//src\app\pages\form\renderForm.js
import { useCallback } from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styles from "../../style/form.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

const getDisplayValue = (val) => {
  if (val == null) return "";

  if (typeof val === "object") {
    if (val.name) return val.name;
    if (val.label) return val.label;
    if (val.value) return val.value;

    // 🔥 กัน object ซ้อน
    if (typeof val.label === "object") return getDisplayValue(val.label);
    if (typeof val.value === "object") return getDisplayValue(val.value);
    if (typeof val.data === "object") return getDisplayValue(val.data);

    return "";
  }

  return val;
};

const renderField = (field, onChange, isPrint, viewMode) => {
  // ===== NORMAL FIELD =====
  if (field.type !== "InputGroup") {
    return (
      <Row key={field.id} className="g-0 align-items-center">
        {field.showLabel && (
          // <Col md={3}>
          <Col xs="auto" className="pe-1 ps-0">
            <Form.Label className={`${styles.titleLabel} ${styles.fontTH}`}>
              {field.label}
            </Form.Label>
          </Col>
        )}

        {/* <Col className={styles.noMinWidth}> */}
        <Col className={`${styles.noMinWidth} ps-1 pe-0`}>
          {/* TEXT INPUT */}
          {field.type === "textInput" &&
            (isPrint ? (
              printText(field.value)
            ) : (
              <Form.Control
                className={`${styles.titleLabel} ${styles.fontTH} form-control-sm mb-2 ${styles.inputCompact}`}
                // value={field.value}
                value={getDisplayValue(field.value)}
                disabled={viewMode}
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
                // value={field.value}
                value={getDisplayValue(field.value)}
                disabled={viewMode}
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
                // value={field.value}
                value={getDisplayValue(field.value)}
                disabled={viewMode}
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
                // value={field.value}
                value={getDisplayValue(field.value)}
                disabled={viewMode}
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
    <Row key={field.id} className="g-0 align-items-center">
      {field.showLabel && (
        <Form.Label
          className={`${styles.titleLabel} ${styles.fontTH} text-center`}
        >
          <b>{field.label}</b>
        </Form.Label>
      )}

      {field.value.map((child) => (
        <Col
          key={child.id}
          xs={12}
          md={colSize}
          className={styles.inputGroupCol}
        >
          {child.showLabel && (
            <Form.Label className={`${styles.titleLabel} ${styles.fontTH}`}>
              {child.label}
            </Form.Label>
          )}

          {isPrint ? (
            field.id === "11f096ed-96c9-463b-8903-842e518a2c97" ? (
              // `(${printText(child.value, true)})`
              <span>{getDisplayValue(child.value)}</span>
            ) : (
              printText(child.value, true)
            )
          ) : (
            <Form.Control
              className={`${styles.titleLabel} ${styles.fontTH} form-control-sm mb-2 ${styles.fullWidth}`}
              // value={child.value}
              value={getDisplayValue(child.value)}
              disabled={viewMode}
              onChange={(e) => onChange(child.id, e.target.value)}
            />
          )}
        </Col>
      ))}
    </Row>
  );
};

// const printText = (value, maxWidth) => (
//   <div
//     className={`
//       ${styles.titleLabel}
//       ${styles.fontTH}
//       form-control-sm
//       mb-2
//       ${styles.printText}
//       ${maxWidth ? styles.printTextFull : ""}
//     `}
//   >
//     {value || " "}
//   </div>
// );

const printText = (value, maxWidth) => {
  const displayValue = getDisplayValue(value);

  return (
    <div
      className={`
        ${styles.titleLabel}
        ${styles.fontTH}
        form-control-sm
        mb-2
        ${styles.printText}
        ${maxWidth ? styles.printTextFull : ""}
      `}
    >
      {displayValue || " "}
    </div>
  );
};

const DynamicFormRenderer = ({
  formFieldJson,
  setisEdit,
  setFormFields,
  isPrint,
  viewMode,
}) => {
  const safeFields = Array.isArray(formFieldJson) ? formFieldJson : [];

  const handleChange = useCallback(
    (id, value) => {
      setisEdit(true);
      setFormFields((prev) => updateFieldValue(prev, id, value));
    },
    [setFormFields],
  );

  const updateFieldValue = (fields, id, value) => {
    if (!Array.isArray(fields)) return [];

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
            child.id === id ? { ...child, value } : child,
          ),
        };
      }

      return field;
    });
  };

  return (
    <div className={styles.formContainer}>
      {safeFields.map((field) =>
        renderField(field, handleChange, isPrint, viewMode),
      )}
      {/* {formFieldJson.map((field) =>
        renderField(field, handleChange, isPrint, viewMode),
      )} */}
    </div>
  );
};

export default DynamicFormRenderer;
