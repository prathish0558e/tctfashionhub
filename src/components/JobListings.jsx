import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "./Reveal.jsx";
import { COMPANY, JOB_LISTINGS } from "../data/content.js";
import { apiUrl } from "../config/site.js";

/*
 * Full careers page for a track with detailed job listings (JD accordion)
 * and a dedicated apply form with resume upload. Used for /careers/it —
 * content comes from JOB_LISTINGS in data/content.js.
 */

const EXPERIENCE_OPTIONS = ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"];

function JobCard({ job, onApply, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="job-card">
      <button
        type="button"
        className="job-card-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="job-card-title">{job.title}</span>
        <span className="job-toggle">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="job-card-body">
          <table className="job-table">
            <tbody>
              <tr>
                <td>Qualification</td>
                <td>{job.qualification}</td>
              </tr>
              <tr>
                <td>Skills Required</td>
                <td>{job.skills}</td>
              </tr>
              <tr>
                <td>Tools</td>
                <td>{job.tools}</td>
              </tr>
              <tr>
                <td>Job Description</td>
                <td>
                  <ul className="job-points">
                    {job.description.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td>Experience</td>
                <td>{job.experience}</td>
              </tr>
            </tbody>
          </table>
          <div className="job-card-foot">
            Excited about this role?{" "}
            <button type="button" className="link-btn" onClick={() => onApply(job.title)}>
              Apply for {job.title} <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobListings({ trackTitle, intro, jobs, showGithubField = true }) {
  const positions = useMemo(() => jobs.map((j) => j.title), [jobs]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: positions[0] || "",
    experience: "",
    github: "",
    coverLetter: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [busy, setBusy] = useState(false);
  const applyRef = useRef(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const scrollToApply = (position) => {
    setForm((f) => ({ ...f, position }));
    applyRef.current?.scrollIntoView({ block: "start" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ state: "idle", msg: "" });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("resume", file);

      const res = await fetch(apiUrl("/api/apply"), { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);

      setStatus({
        state: "ok",
        msg: body.message || "Application received!",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        position: positions[0] || "",
        experience: "",
        github: "",
        coverLetter: "",
      });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setStatus({ state: "err", msg: err.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* ---------- Intro ---------- */}
      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="container">
          <Reveal>
            <div className="career-intro">
              {/* PageHero already owns the page's single <h1>; this is a
                  section heading and must stay <h2> for SEO/a11y. */}
              <h2>{trackTitle} Career Opportunities</h2>
              {intro.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
              <p>Check out our current openings below and apply today!</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Jobs + Apply form ---------- */}
      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="careers-grid">
            <div>
              <h2 className="careers-col-title">
                <i className="bi bi-briefcase"></i> Current Openings
              </h2>
              <div className="job-list">
                {jobs.map((j, i) => (
                  <Reveal key={j.title} delay={i * 80}>
                    <JobCard job={j} onApply={scrollToApply} defaultOpen={i === 0} />
                  </Reveal>
                ))}
              </div>
            </div>

            <div ref={applyRef}>
              <h2 className="careers-col-title">
                <i className="bi bi-send"></i> Apply Now
              </h2>
              <form className="form-card apply-form" onSubmit={onSubmit}>
                {status.state === "ok" && (
                  <div className="banner ok">
                    <i className="bi bi-check-circle me-1"></i> {status.msg}
                  </div>
                )}
                {status.state === "err" && (
                  <div className="banner err">
                    <i className="bi bi-exclamation-triangle me-1"></i> {status.msg}
                  </div>
                )}

                <div className="field">
                  <label htmlFor="ap-name">Full Name *</label>
                  <input
                    id="ap-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="ap-phone">Contact Number *</label>
                  <input
                    id="ap-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div className="field">
                  <label htmlFor="ap-email">Email Address *</label>
                  <input
                    id="ap-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-row two">
                  <div className="field">
                    <label htmlFor="ap-pos">Position Applying For *</label>
                    <select id="ap-pos" required value={form.position} onChange={set("position")}>
                      {positions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="ap-exp">Years of Experience *</label>
                    <select id="ap-exp" required value={form.experience} onChange={set("experience")}>
                      <option value="">Select experience</option>
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="ap-res">Upload Resume * (PDF / DOC, max 5 MB)</label>
                  <input
                    id="ap-res"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>

                {showGithubField && (
                  <div className="field">
                    <label htmlFor="ap-gh">GitHub Profile</label>
                    <input
                      id="ap-gh"
                      type="url"
                      value={form.github}
                      onChange={set("github")}
                      placeholder="https://github.com/yourname"
                    />
                  </div>
                )}

                <div className="field">
                  <label htmlFor="ap-cl">
                    {showGithubField ? "Cover Letter" : "About Yourself (optional)"}
                  </label>
                  <textarea
                    id="ap-cl"
                    rows={4}
                    value={form.coverLetter}
                    onChange={set("coverLetter")}
                    placeholder={
                      showGithubField
                        ? "Tell us about your experience and approach…"
                        : "Tell us a bit about yourself and your goals…"
                    }
                  ></textarea>
                </div>

                <div className="form-buttons">
                  <button className="btn btn-primary" disabled={busy}>
                    {busy ? "Submitting…" : "Submit Application"}
                    {!busy && <i className="bi bi-arrow-right"></i>}
                  </button>
                  <button
                    type="reset"
                    className="btn btn-outline"
                    onClick={() => setStatus({ state: "idle", msg: "" })}
                  >
                    Cancel
                  </button>
                </div>

                <p className="form-note">
                  <i className="bi bi-shield-lock me-1"></i>
                  Your details stay private — HR replies within a few working days. Questions?{" "}
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
