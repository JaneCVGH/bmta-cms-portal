"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import styles from "../../style/dashboard.module.css";

const CASE_API =
  "https://welcome-service-stg.metthier.ai:65000/api/v1/case?start=0&length=1000";

const STATUS_API =
  "https://welcome-service-stg.metthier.ai:65000/api/v1/case_status?start=0&length=30";

export default function DashboardPage() {

  const router = useRouter();

  const [cases, setCases] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [hover, setHover] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [locked, setLocked] = useState(false);   // คลิกล็อค
  const [activeMonth, setActiveMonth] = useState(null); // เดือนที่ hover อยู่
  const [viewMode, setViewMode] = useState("month");

  /* ---------------- TOKEN ---------------- */

  const getToken = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("accessToken")
  }

  /* ---------------- LOAD STATUS ---------------- */

  useEffect(() => {

    const load = async () => {

      const token = getToken()

      if (!token) {
        router.push("/pages/login")
        return
      }

      try {

        const res = await fetch(STATUS_API, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const j = await res.json()

        const map = {}

        j.data?.forEach(s => {

          /*map[s.statusId] = {
            label: s.th || s.name,
            color: (!s.color || s.color === "\\N") ? "#64748b" : s.color
          }*/

        })

        setStatusMap(map)

      } catch (e) {
        console.error("STATUS ERROR", e)
      }

    }

    load()

  }, [router])


  const getStatusLabel = (statusId) => {
    const map = {
      //S000: "ร่าง",
      S001: "สร้างเหตุใหม่",
      //S003: "มอบหมายงาน",
      //S004: "รับงาน",
      S015: "กำลังดำเนินงาน",
      S016: "เสร็จสิ้น",
      S007: "ปิดงาน",
      S014: "ยกเลิกงาน",
    };

    return map[statusId] || statusId;
  };

  /* ---------------- LOAD CASES ---------------- */

  useEffect(() => {

    const load = async () => {

      const token = getToken()

      if (!token) {
        router.push("/pages/login")
        return
      }

      try {

        const res = await fetch(CASE_API, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const j = await res.json()

        setCases(Array.isArray(j.data) ? j.data : [])

      } catch (e) {
        console.error("CASE ERROR", e)
      }

    }

    load()

  }, [router])


  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!locked) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (!el?.closest(`.${styles.stack}`)) {
        setLocked(false);
        setHover(null);
        setActiveMonth(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [locked]);



  useEffect(() => {
    const handleClickOutside = (e) => {

      if (e.target.closest(`.${styles.tooltip}`)) return;
      if (e.target.closest(`.${styles.stack}`)) return;

      setLocked(false);
      setHover(null);
      setActiveMonth(null);
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);


  /* ---------------- DATE KEY ---------------- */

  const getMonthKey = (c) => {

    const raw =
      c.createdDate ||
      c.createdAt ||
      c.created_date ||
      c.createDate ||
      c.create_date

    if (!raw) return "Unknown"

    const d = new Date(raw)

    //return d.toLocaleDateString("th-TH", { month: "short", year: "numeric" })
    return d.toLocaleDateString("th-TH", {
      month: "short",
      year: "numeric",
    });
  }

  const getDayKey = (c) => {
    const raw =
      c.createdDate ||
      c.createdAt ||
      c.created_date ||
      c.createDate ||
      c.create_date;

    if (!raw) return "Unknown";

    const d = new Date(raw);

    return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  };


  /* ---------------- GROUP DATA ---------------- */

  const summary = useMemo(() => {
    const map = {};

    cases.forEach((c) => {
      const key =
        viewMode === "month" ? getMonthKey(c) : getDayKey(c);

      if (!map[key]) map[key] = {};

      const sid = c.statusId || "UNKNOWN";
      map[key][sid] = (map[key][sid] || 0) + 1;
    });

    return map;
  }, [cases, viewMode]);



  /* ---------------- LAST 6 MONTHS ---------------- */

  const timeline = useMemo(() => {
    const arr = [];

    const now = new Date();

    if (viewMode === "month") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        arr.push(
          d.toLocaleDateString("th-TH", {
            month: "short",
            year: "numeric",
          })
        );
      }
    } else {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        arr.push(
          d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        );
      }
    }

    return arr;
  }, [viewMode]);

  /* ---------------- SORT MONTH ---------------- 
  
  const sortedMonths = useMemo(()=>{
  
  return Object.keys(summary).sort((a,b)=>{
  
  return new Date(a) - new Date(b)
  
  })
  
  },[summary])
  */

  /* ---------------- Bar Color  ---------------- */

  const getStatusClass = (statusId) => {
    const map = {
      //S000: styles.statusDraft,
      S001: styles.statusNew,
      //S003: styles.statusDispatch,
      //S004: styles.statusAck,
      S015: styles.statusProgress,
      //S016: styles.statusDone,
      S007: styles.statusClosed,
      S014: styles.statusCancel,
    };

    return map[statusId] || "";
  };


  /* ---------------- SLA ---------------- */

  const sla = useMemo(() => {


    let pass = 0
    let fail = 0

    cases.forEach(c => {

      if (Number(c.caseSla) >= 100) pass++
      else fail++

    })



    const total = pass + fail || 1

    return {

      pass,
      fail,
      passPercent: Math.round(pass / total * 100),
      failPercent: Math.round(fail / total * 100)

    }

  }, [cases])


  const statusSummary = useMemo(() => {
    const result = {
      total: 0,
      done: 0,
      progress: 0,
      new: 0,
    };

    cases.forEach((c) => {
      const sid = c.statusId;

      result.total++;

      if (sid === "S016" || sid === "S007") result.done++;
      else if (sid === "S015") result.progress++;
      else result.new++;
    });

    return result;
  }, [cases]);


  const percent = {
    done:
      Math.round((statusSummary.done / statusSummary.total) * 100) || 0,
    progress:
      Math.round((statusSummary.progress / statusSummary.total) * 100) || 0,
  };

  /* ---------------- MAX BAR ---------------- */

  const maxTotal = Math.max(

    ...timeline.map(m => {

      const statuses = summary[m] || {}

      return Object.values(statuses).reduce((a, b) => a + b, 0)

    }),

    1
  )


  return (

    <>
      <Navbar />

      <div className={styles.dashboard}>

        <div className={styles.headerRow}>
          <h2>สรุปใบสั่งงาน</h2>
        </div>


        {/* -------- BAR CHART -------- */}

        <div className={styles.panel}>

          <h4>
            จำนวนใบงานราย{viewMode === "month" ? "เดือน" : "วัน"}
          </h4>

          <div className={styles.toggle}>
            <button
              className={viewMode === "month" ? styles.active : ""}
              onClick={() => setViewMode("month")}
            >
              รายเดือน
            </button>

            <button
              className={viewMode === "day" ? styles.active : ""}
              onClick={() => setViewMode("day")}
            >
              รายวัน
            </button>
          </div>

          <div className={styles.barChart}>

            {timeline.map((month) => {

              const statuses = summary[month] || {}

              const total = Object.values(statuses).reduce((a, b) => a + b, 0)

              return (

                <div key={month} className={styles.barCol}>

                  <div className={styles.stack}
                    onMouseEnter={(e) => {
                      if (total === 0) return;

                      const rect = e.currentTarget.getBoundingClientRect();

                      setHover({
                        month,
                        data: statuses
                      });

                      setActiveMonth(month);

                      setTooltipPos({
                        x: rect.right,                 // ด้านขวาของแท่ง
                        y: rect.top + rect.height / 2  // กึ่งกลางแนวตั้ง
                      });
                    }}
                    onMouseLeave={() => {
                      if (!locked) {
                        setHover(null);
                        setActiveMonth(null);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      //setLocked(true);

                      if (locked && activeMonth === month) {
                        setLocked(false);
                        setHover(null);
                        setActiveMonth(null);
                      } else {
                        setLocked(true);
                        setActiveMonth(month);
                      }
                    }}
                  >

                    {Object.entries(statuses).map(([sid, val]) => {

                      const h = (val / maxTotal) * 220

                      return (

                        /*<div
                          key={sid}
                          className={styles.bar}
                          style={{
                            height: h,
                            background: statusMap[sid]?.color || "#3b82f6"
                          }}*/

                        <div
                          key={sid}
                          className={`${styles.bar} ${getStatusClass(sid)}`}
                          style={{
                            height: h
                          }}
                        />



                        /*onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                      
                        setHover({
                          month,
                          sid,
                          val,
                          label: statusMap[sid]?.label
                        });
                      
                        setTooltipPos({
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}*/


                        /*onMouseMove={(e) => {
                          setTooltipPos({
                            x: e.clientX,
                            y: e.clientY
                          });
                        }}
                        onMouseLeave={() => setHover(null)}*/


                      )

                    })}

                  </div>

                  <span className={styles.month}>{month}</span>

                </div>

              )

            })}

          </div>

          {/* tooltip */}

          {hover && (
            <div
              className={styles.tooltip}
              style={{
                top: tooltipPos.y,   // ขึ้นเหนือ bar
                left: tooltipPos.x     // จัดให้อยู่กลาง bar + ขยับออกด้านขวา
              }}
            >
              {/*<div>{hover.month}</div>
    <div>{hover.label}</div>
    <b>{hover.val} งาน</b>*/}
              <div><b>{hover.month}</b></div>

              {Object.entries(hover.data).map(([sid, val]) => (
                <div key={sid} style={{ display: "flex", gap: 6 }}>
                  {/*<div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: getComputedStyle(document.documentElement)
                    }}
                  />*/}
                  <div
                    className={getStatusClass(sid)}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%"
                    }}
                  />
                  <span>{getStatusLabel(sid)}</span>
                  <b>{val}</b>
                </div>
              ))}

            </div>
          )}

          {/* legend */}

          <div className={styles.legend}>

            {/*{Object.entries(statusMap).map(([sid, s]) => (

              <div key={sid} className={styles.legendItem}>

                {/*<div
                  className={styles.dot}
                  style={{ background: s.color }}
                  />*
                <div className={`${styles.dot} ${getStatusClass(sid)}`} />

                <span>{s.label}</span>

              </div>
                
            ))} */}
            {Object.keys({
              S001: 1, S015: 1, S007: 1, S014: 1
            }).map((sid) => (

              <div key={sid} className={styles.legendItem}>

                <div className={`${styles.dot} ${getStatusClass(sid)}`} />

                <span>{getStatusLabel(sid)}</span>

              </div>

            ))}

          </div>

        </div>


        {/* -------- SLA -------- */}

        {/*<div className={styles.slapanel}>

          <h4>SLA Performance</h4>

          <div className={styles.slaChart}>

            <div
              className={styles.slaPass}
              style={{ width: `${sla.passPercent}%` }}
            >
              {sla.passPercent}%
            </div>

            <div
              className={styles.slaFail}
              style={{ width: `${sla.failPercent}%` }}
            >
              {sla.failPercent}%
            </div>

          </div>

          <div className={styles.slaText}>

            <div>เสร็จทัน SLA : {sla.pass}</div>
            <div>เกิน SLA : {sla.fail}</div>

          </div>

        </div>*/}


        {/*-----------  ภาพรวมสถานะใบสั่งงานทั้งหมด -----------------*/}

        <div className={styles.panel}>
          <h4>ภาพรวมสถานะใบสั่งงานทั้งหมด</h4>

          <div className={styles.overviewRow}>
            {/* ข้อมูลด้านซ้าย */}
            <div className={styles.overviewLeft}>

            <div className={styles.donutWrap}>
              <div
                className={styles.donut}
                style={{
                  background: `conic-gradient(
          #22c55e 0% ${percent.done}%,
          #3b82f6 ${percent.done}% ${percent.done + percent.progress}%,
          #eab308 ${percent.done + percent.progress}% 100%
        )`,
                }}
              >
                <div className={styles.center}>
                  <div>รวม</div>
                  <b>{statusSummary.total}</b>
                </div>
              </div>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: "#22c55e" }} />
                  ปิดงาน {statusSummary.done}
                </div>

                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: "#3b82f6" }} />
                  กำลังดำเนินงาน {statusSummary.progress}
                </div>

                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: "#eab308" }} />
                  งานใหม่ {statusSummary.new}
                </div>
              </div>
              
              </div>
              
            {/* ข้อมูลด้านขวา */}
            <div className={styles.overviewRight}>
              {/*<div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: "#22c55e" }} />
                  เสร็จสิ้น {statusSummary.done}
                </div>

                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: "#3b82f6" }} />
                  กำลังดำเนินการ {statusSummary.progress}
                </div>

                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: "#eab308" }} />
                  งานใหม่ {statusSummary.new}
                </div>
              </div>*/}

              <div className={styles.statusBoxWrap}>

                {/* เสร็จสิ้น */}
                <div className={styles.statusBoxDone}>
                  <div>ปิดงาน</div>
                  <b>{statusSummary.done}</b>
                </div>

                {/* กำลังดำเนินการ */}
                <div className={styles.statusBoxProgress}>
                  <div>กำลังดำเนินงาน</div>
                  <b>{statusSummary.progress}</b>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>

  )

}