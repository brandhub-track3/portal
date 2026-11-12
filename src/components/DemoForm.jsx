import { useState } from 'react'

const initialValues = {
  name: '',
  workEmail: '',
  company: '',
  message: '',
  consent: false,
  website: '',
}

export function DemoForm() {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const validate = () => {
    const nextErrors = {}

    if (!formData.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!formData.workEmail.trim()) nextErrors.workEmail = 'Work email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
      nextErrors.workEmail = 'Enter a valid work email address.'
    }
    if (!formData.company.trim()) nextErrors.company = 'Company name is required.'
    if (!formData.message.trim()) nextErrors.message = 'Tell us a little about your use case.'
    else if (formData.message.trim().length < 20) nextErrors.message = 'Message should be at least 20 characters.'
    if (!formData.consent) nextErrors.consent = 'Please give consent before submitting.'
    if (formData.website) nextErrors.website = 'Invalid submission.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

 
const API_URL = "http://localhost:8000/wordpress/wp-json/brandhub/v1/leads";

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!validate()) {
    setStatus("error");
    return;
  } 

  setStatus("loading");

  try {
    // Generate a unique ID for this submission.
    const submissionId = crypto.randomUUID();
 
    const payload = {
      submission_id: submissionId,
      name: formData.name.trim(),
      email: formData.workEmail.trim(),
      company: formData.company.trim(),
      message: formData.message.trim(),
      consent: formData.consent,
      website: formData.website
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Unable to submit demo request."
      );
    }

    console.log("Demo request submitted", {
      leadId: result.lead_id,
      success: result.success
    });

    setStatus("success");
    setFormData(initialValues);
    setErrors({});

  } catch (error) {
    console.error("Demo submission failed:", error.message);
    setStatus("error");

  } finally {
    setStatus((current) =>
      current === "loading" ? "error" : current
    );
  }
};


  const updateField = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  return (
    <section className="demo-section">
      <div className="demo-intro">
        <p className="eyebrow">Let’s talk</p>
        <h1>See how BrandHub can make content easier to find.</h1>
        <p>Tell us a little about your setup, and we’ll show you how a single search experience can save time for your team.</p>
      </div>

      <form className="demo-form" onSubmit={handleSubmit} noValidate>
        <div className="field-row two-up">
          <div className="field-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            {errors.name ? <span className="error-text">{errors.name}</span> : null}
          </div>

          <div className="field-group">
            <label htmlFor="workEmail">Work email</label>
            <input
              id="workEmail"
              type="email"
              value={formData.workEmail}
              onChange={(event) => updateField('workEmail', event.target.value)}
            />
            {errors.workEmail ? <span className="error-text">{errors.workEmail}</span> : null}
          </div>
        </div>

        <div className="field-row two-up">
          <div className="field-group">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              value={formData.company}
              onChange={(event) => updateField('company', event.target.value)}
            />
            {errors.company ? <span className="error-text">{errors.company}</span> : null}
          </div>

          <div className="field-group hidden-field">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              value={formData.website}
              onChange={(event) => updateField('website', event.target.value)}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows="5"
            value={formData.message}
            onChange={(event) => updateField('message', event.target.value)}
          />
          {errors.message ? <span className="error-text">{errors.message}</span> : null}
        </div>

        <label className="checkbox-row" htmlFor="consent">
          <input
            id="consent"
            type="checkbox"
            checked={formData.consent}
            onChange={(event) => updateField('consent', event.target.checked)}
          />
          <span>I agree to be contacted about this demo request.</span>
        </label>
        {errors.consent ? <span className="error-text">{errors.consent}</span> : null}

        <button type="submit" className="primary-button" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting...' : 'Request demo'}
        </button>

        {status === 'success' ? (
          <div className="status success">Your request has been submitted. Our team will be in touch soon.</div>
        ) : null}

        {status === 'error' ? (
          <div className="status error">We could not send your request. Please review the form and try again.</div>
        ) : null}
      </form>
    </section>
  )
}
