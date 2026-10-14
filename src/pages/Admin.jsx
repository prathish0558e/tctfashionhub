import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/Reveal.jsx";
import {
  clearSession,
  deleteTourEnquiry,
  getApplications,
  getAuthLog,
  getHealth,
  getInternships,
  getLeads,
  getSavedUser,
  getSessions,
  getTourEnquiries,
  postLogout,
  postRevokeSession,
} from "../api.js";

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ApplicationsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No applications yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applied</th>
            <th>Candidate</th>
            <th>Contact</th>
            <th>Position</th>
            <th>Experience</th>
            <th>GitHub</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="admin-date">{fmtDate(a.createdAt)}</td>
              <td>
                <strong>{a.name}</strong>
                {a.coverLetter && (
                  <p className="admin-note" title={a.coverLetter}>
                    “{a.coverLetter.slice(0, 80)}
                    {a.coverLetter.length > 80 ? "…" : ""}”
                  </p>
                )}
              </td>
              <td>
                <a href={`mailto:${a.email}`}>{a.email}</a>
                <br />
                <a href={`tel:${a.phone}`}>{a.phone || "—"}</a>
              </td>
              <td>{a.position}</td>
              <td>{a.experience}</td>
              <td>
                {a.github ? (
                  <a href={a.github} target="_blank" rel="noopener noreferrer">
                    profile
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td>
                {a.resumeUrl ? (
                  <a className="btn btn-outline btn-sm" href={a.resumeUrl} download>
                    <i className="bi bi-download"></i> Resume
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InternshipsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No internship applications yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applied</th>
            <th>Candidate</th>
            <th>Contact</th>
            <th>College</th>
            <th>Domain</th>
            <th>Duration</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="admin-date">{fmtDate(a.createdAt)}</td>
              <td>
                <strong>{a.name}</strong>
                <p className="admin-note">
                  {a.degree || "—"} · {a.year || "—"}
                  {a.message ? ` · “${a.message.slice(0, 60)}${a.message.length > 60 ? "…" : ""}”` : ""}
                </p>
              </td>
              <td>
                <a href={`mailto:${a.email}`}>{a.email}</a>
                <br />
                <a href={`tel:${a.phone}`}>{a.phone}</a>
              </td>
              <td>{a.college}</td>
              <td>{a.domain}</td>
              <td>{a.duration || "—"}</td>
              <td>
                {a.resumeUrl ? (
                  <a className="btn btn-outline btn-sm" href={a.resumeUrl} download>
                    <i className="bi bi-download"></i> Resume
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EVENT_META = {
  login: { icon: "bi-box-arrow-in-right", label: "Login", cls: "ok" },
  logout: { icon: "bi-box-arrow-left", label: "Logout", cls: "muted" },
  "force-logout": { icon: "bi-shield-x", label: "Force logout", cls: "warn" },
  failed: { icon: "bi-shield-exclamation", label: "Failed attempt", cls: "err" },
};

function AuthLogTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-clock-history"></i> No login activity recorded yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Email used</th>
            <th>Device</th>
            <th>IP address</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const meta = EVENT_META[e.type] || EVENT_META.failed;
            return (
              <tr key={e.id}>
                <td className="admin-date">{fmtDate(e.createdAt)}</td>
                <td>
                  <span className={`authpill ${meta.cls}`}>
                    <i className={`bi ${meta.icon}`}></i> {meta.label}
                  </span>
                </td>
                <td>{e.email || "—"}</td>
                <td>{e.device || e.deviceSummary || "—"}</td>
                <td className="admin-date">{e.ip || "—"}</td>
                <td className="admin-date">{e.location || "Resolving…"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SessionsPanel({ sessions, currentTokenPreview, onRevoke, busyPreview }) {
  if (!sessions.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-hdd-network"></i> No active sessions.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>IP address</th>
            <th>Location</th>
            <th>Signed in</th>
            <th>Last active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.tokenPreview}>
              <td>
                <strong>{s.device}</strong>
                {s.current && <span className="authpill ok" style={{ marginLeft: 8 }}><i className="bi bi-person-check"></i> This device</span>}
              </td>
              <td className="admin-date">{s.ip}</td>
              <td className="admin-date">{s.location || "Resolving…"}</td>
              <td className="admin-date">{fmtDate(s.createdAt)}</td>
              <td className="admin-date">{fmtDate(s.lastSeenAt)}</td>
              <td>
                {s.current ? (
                  <span className="admin-date">—</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busyPreview === s.tokenPreview}
                    onClick={() => onRevoke(s.tokenPreview)}
                  >
                    <i className="bi bi-box-arrow-right"></i>{" "}
                    {busyPreview === s.tokenPreview ? "Logging out…" : "Force logout"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TourEnquiriesTable({ rows, onDelete, busyId }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No tour enquiries yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Received</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Destination</th>
            <th>Trip details</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td className="admin-date">{fmtDate(t.createdAt)}</td>
              <td>
                <strong>{t.name}</strong>
              </td>
              <td>
                <a href={`tel:${t.phone}`}>{t.phone}</a>
                <br />
                {t.email ? <a href={`mailto:${t.email}`}>{t.email}</a> : "—"}
              </td>
              <td>
                <strong>{t.destination}</strong>
                {t.scope && <div className="admin-note">{t.scope}</div>}
              </td>
              <td>
                <span className="admin-note">
                  {t.travelDate ? `📅 ${t.travelDate}` : "📅 —"}
                  <br />
                  👥 {t.travelers || "—"} travellers
                  {t.budget ? <><br />💰 {t.budget}</> : null}
                  {t.flightNeeded ? <><br />✈️ {t.flightNeeded}</> : null}
                  {t.passportAvailable ? <><br />🛂 {t.passportAvailable}</> : null}
                </span>
              </td>
              <td className="admin-msg">
                {t.message || "—"}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={busyId === t.id}
                  onClick={() => onDelete(t.id)}
                >
                  <i className="bi bi-trash3"></i>{" "}
                  {busyId === t.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No enquiries yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Received</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Service</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id}>
              <td className="admin-date">{fmtDate(l.createdAt)}</td>
              <td>
                <strong>{l.name}</strong>
              </td>
              <td>
                <a href={`mailto:${l.email}`}>{l.email}</a>
                <br />
                <a href={`tel:${l.phone}`}>{l.phone || "—"}</a>
              </td>
              <td>{l.service || "—"}</td>
              <td className="admin-msg">{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin() {
  // Start locked; only a successful server check unlocks the dashboard.
  // (Trusting localStorage alone let anyone with devtools open /admin.)
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("applications");
  const [apps, setApps] = useState(null);
  const [leads, setLeads] = useState(null);
  const [authlog, setAuthlog] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [revoking, setRevoking] = useState("");
  const [interns, setInterns] = useState(null);
  const [tours, setTours] = useState(null);
  const [deletingTour, setDeletingTour] = useState("");
  const [error, setError] = useState("");
  const [dbWarn, setDbWarn] = useState("");
  const [checkErr, setCheckErr] = useState("");

  const load = () => {
    setError("");
    // Every request must settle: a failed fetch shows the error banner and
    // empties the table instead of leaving "Loading…" on screen forever.
    const fail = (setter) => (e) => {
      setter([]);
      setError((prev) => prev || e.message || "Could not load data from the server.");
    };
    getApplications().then(setApps).catch(fail(setApps));
    getLeads().then(setLeads).catch(fail(setLeads));
    getAuthLog().then(setAuthlog).catch(fail(setAuthlog));
    getSessions().then(setSessions).catch(fail(setSessions));
    getInternships().then(setInterns).catch(fail(setInterns));
    getTourEnquiries().then(setTours).catch(fail(setTours));
    // Warn (don't block) when the database is not actually connected — that is
    // why freshly submitted records can vanish from this page.
    getHealth()
      .then((h) =>
        setDbWarn(
          h && h.db === "connected"
            ? ""
            : `Database is not connected (${(h && h.db) || "unknown"}). New submissions are stored temporarily and may disappear.`
        )
      )
      .catch(() => setDbWarn(""));
  };

  // Verify the saved token against the server before showing anything.
  useEffect(() => {
    let alive = true;
    const saved = getSavedUser();
    if (!saved) {
      setChecking(false);
      return;
    }
    getApplications()
      .then(() => {
        if (alive) {
          setUser(saved);
          setChecking(false);
          load();
        }
      })
      .catch((e) => {
        if (alive) {
          // 401 = expired token (already cleared). Anything else means the
          // server itself is unreachable — say so instead of silently
          // bouncing the user to the sign-in screen.
          if (!e.status || e.status >= 500) setCheckErr(e.message || "");
          clearSession();
          setChecking(false);
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeTour = (id) => {
    setDeletingTour(id);
    deleteTourEnquiry(id)
      .then(() => setTours((prev) => (prev || []).filter((t) => t.id !== id)))
      .catch((e) => setError(e.message))
      .finally(() => setDeletingTour(""));
  };

  const signOut = () => {
    postLogout().catch(() => {}); // record logout event server-side
    clearSession();
    setUser(null);
  };

  const revokeSession = (tokenPreview) => {
    setRevoking(tokenPreview);
    postRevokeSession(tokenPreview)
      .then(() => {
        setSessions((prev) => (prev || []).filter((s) => s.tokenPreview !== tokenPreview));
        getAuthLog().then(setAuthlog).catch(() => {}); // refresh activity log
      })
      .catch((e) => setError(e.message))
      .finally(() => setRevoking(""));
  };

  if (checking) {
    return (
      <div className="section admin-guard">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="admin-empty">
            <i className="bi bi-hourglass-split"></i> Checking session…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section admin-guard">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="info-card" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="icon" style={{ margin: "0 auto 14px" }}>
              <i className="bi bi-shield-lock"></i>
            </div>
            {/* The only public view of /admin — it must own the page <h1>.
                Inline fontSize keeps the old <h2> look exactly. */}
            <h1 style={{ marginBottom: 8, fontSize: "1.5rem" }}>Admin area</h1>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>
              Please sign in with the admin account to view job applications
              and enquiries.
            </p>
            {checkErr && (
              <div className="banner err" style={{ marginBottom: 22, textAlign: "left" }}>
                <i className="bi bi-exclamation-triangle me-1"></i> {checkErr}
              </div>
            )}
            <Link to="/login" className="btn btn-primary btn-lg">
              Go to Sign In <i className="bi bi-box-arrow-in-right"></i>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="TCT Admin"
        title="Applications & Enquiries"
        text="Signed in as admin — review job applicants, download resumes and read website enquiries."
        crumb="Admin"
      />

      <section className="section" style={{ paddingTop: 34 }}>
        <div className="container">
          <div className="admin-bar">
            <div className="tech-tabs" role="tablist" style={{ margin: 0 }}>
              <button
                role="tab"
                aria-selected={tab === "applications"}
                className={`tech-tab ${tab === "applications" ? "active" : ""}`}
                onClick={() => setTab("applications")}
              >
                <i className="bi bi-briefcase me-1"></i> Job Applications
                {apps && <span className="admin-count">{apps.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "leads"}
                className={`tech-tab ${tab === "leads" ? "active" : ""}`}
                onClick={() => setTab("leads")}
              >
                <i className="bi bi-envelope me-1"></i> Quote Enquiries
                {leads && <span className="admin-count">{leads.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "interns"}
                className={`tech-tab ${tab === "interns" ? "active" : ""}`}
                onClick={() => setTab("interns")}
              >
                <i className="bi bi-mortarboard me-1"></i> Internships
                {interns && <span className="admin-count">{interns.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "tours"}
                className={`tech-tab ${tab === "tours" ? "active" : ""}`}
                onClick={() => setTab("tours")}
              >
                <i className="bi bi-airplane-engines me-1"></i> Tour Enquiries
                {tours && <span className="admin-count">{tours.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "authlog"}
                className={`tech-tab ${tab === "authlog" ? "active" : ""}`}
                onClick={() => setTab("authlog")}
              >
                <i className="bi bi-clock-history me-1"></i> Login Activity
              </button>
            </div>
            <div className="admin-bar-actions">
              <button className="btn btn-outline btn-sm" onClick={load}>
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
              <button className="btn btn-outline btn-sm" onClick={signOut}>
                <i className="bi bi-box-arrow-right"></i> Sign out
              </button>
            </div>
          </div>

          {error && (
            <div className="banner err" style={{ marginBottom: 16 }}>
              <i className="bi bi-exclamation-triangle me-1"></i> {error}
            </div>
          )}

          {dbWarn && (
            <div className="banner warn" style={{ marginBottom: 16 }}>
              <i className="bi bi-database-exclamation me-1"></i> {dbWarn}
            </div>
          )}

          {tab === "applications" ? (
            apps === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <ApplicationsTable rows={apps} />
            )
          ) : tab === "leads" ? (
            leads === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <LeadsTable rows={leads} />
            )
          ) : tab === "interns" ? (
            interns === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <InternshipsTable rows={interns} />
            )
          ) : tab === "tours" ? (
            tours === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <TourEnquiriesTable
                rows={tours}
                onDelete={removeTour}
                busyId={deletingTour}
              />
            )
          ) : authlog === null ? (
            <div className="admin-empty">
              <i className="bi bi-hourglass-split"></i> Loading…
            </div>
          ) : (
            <>
              <h3 className="careers-col-title" style={{ fontSize: "1.05rem", marginTop: 6 }}>
                <i className="bi bi-hdd-network"></i> Active Sessions
              </h3>
              {sessions === null ? (
                <div className="admin-empty">
                  <i className="bi bi-hourglass-split"></i> Loading…
                </div>
              ) : (
                <SessionsPanel
                  sessions={sessions}
                  onRevoke={revokeSession}
                  busyPreview={revoking}
                />
              )}

              <h3 className="careers-col-title" style={{ fontSize: "1.05rem", marginTop: 26 }}>
                <i className="bi bi-clock-history"></i> Login Activity
              </h3>
              <AuthLogTable rows={authlog} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
