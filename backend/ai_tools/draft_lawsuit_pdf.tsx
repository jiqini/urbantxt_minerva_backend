/*
 * Description:
 *   React component for drafting a Salvadoran lawsuit. Collects user input for all required legal fields,
 *   submits the data to a backend endpoint for PDF generation, and allows the user to download the resulting document.
 *
 * Usage:
 *   - Import and render <DraftLawsuitUI /> in your application.
 *   - Ensure your backend exposes a /generate-lawsuit endpoint that accepts form data and returns a PDF.
 *
 * Author: Ji Qi Ni, July 21, 2025
 */

import { useState } from 'react';

interface LawsuitFormData {
  ciudad: string;
  nombreCompleto: string;
  edad: string;
  profesion: string;
  dui: string;
  direccionResidencia: string;
  notificaciones: string;
  hechos: string;
  fundamento: string;
  pretensiones: string;
  pruebas: string;
  ciudadFirma: string;
  fecha: string;
  firma: string;
}

const initialForm: LawsuitFormData = {
  ciudad: '',
  nombreCompleto: '',
  edad: '',
  profesion: '',
  dui: '',
  direccionResidencia: '',
  notificaciones: '',
  hechos: '',
  fundamento: '',
  pretensiones: '',
  pruebas: '',
  ciudadFirma: '',
  fecha: '',
  firma: '',
};

const DraftLawsuitUI: React.FC = () => {
  const [form, setForm] = useState<LawsuitFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Replace with your backend endpoint
      const res = await fetch('/generate-lawsuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error generating PDF');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'demanda.pdf';
      link.click();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Plaintiff's Information */}
      <h2>Datos del Demandante</h2> {/* Plaintiff's Information */}
      <label>Ciudad del Juzgado: {/* City of the Court */}
        <input name="ciudad" value={form.ciudad} onChange={handleChange} required />
      </label><br />
      <label>Nombre completo: {/* Full Name */}
        <input name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} required />
      </label><br />
      <label>Edad: {/* Age */}
        <input name="edad" value={form.edad} onChange={handleChange} type="number" />
      </label><br />
      <label>Profesión u ocupación: {/* Profession or Occupation */}
        <input name="profesion" value={form.profesion} onChange={handleChange} />
      </label><br />
      <label>Número de DUI o pasaporte: {/* ID Number or Passport */}
        <input name="dui" value={form.dui} onChange={handleChange} />
      </label><br />
      <label>Dirección de residencia: {/* Residence Address */}
        <input name="direccionResidencia" value={form.direccionResidencia} onChange={handleChange} />
      </label><br />
      <label>Dirección para notificaciones: {/* Address for Legal Notifications */}
        <input name="notificaciones" value={form.notificaciones} onChange={handleChange} />
      </label><br />

      {/* Facts of the Case */}
      <h2>Relación de los Hechos</h2> {/* Facts of the Case */}
      <textarea name="hechos" value={form.hechos} onChange={handleChange} rows={5} required />

      {/* Legal Basis */}
      <h2>Fundamento de Derecho</h2> {/* Legal Basis */}
      <textarea name="fundamento" value={form.fundamento} onChange={handleChange} rows={4} />

      {/* Requests to the Court */}
      <h2>Pretensiones</h2> {/* Requests to the Court */}
      <textarea name="pretensiones" value={form.pretensiones} onChange={handleChange} rows={4} required />

      {/* Offered Evidence */}
      <h2>Oferta de Pruebas</h2> {/* Offered Evidence */}
      <textarea name="pruebas" value={form.pruebas} onChange={handleChange} rows={4} />

      {/* Signature and Date */}
      <h2>Firma y Fecha</h2> {/* Signature and Date */}
      <label>Ciudad de firma: {/* City of Signature */}
        <input name="ciudadFirma" value={form.ciudadFirma} onChange={handleChange} />
      </label><br />
      <label>Fecha: {/* Date */}
        <input name="fecha" value={form.fecha} onChange={handleChange} type="date" />
      </label><br />
      <label>Firma del demandante: {/* Plaintiff's Signature */}
        <input name="firma" value={form.firma} onChange={handleChange} />
      </label><br />

      <button type="submit" disabled={submitting} style={{ marginTop: 16 }}>
        {submitting ? 'Generando PDF...' : 'Generar Demanda PDF'} {/* Generate Lawsuit PDF */}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default DraftLawsuitUI;
