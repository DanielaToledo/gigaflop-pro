import nodemailer from 'nodemailer';


import dotenv from 'dotenv';

dotenv.config();
console.log('Correo configurado:', process.env.EMAIL_USER);

export const enviarCotizacion = async (req, res) => {
  const { clienteEmail, asunto, htmlCotizacion } = req.body;

  if (!clienteEmail || typeof clienteEmail !== 'string' || clienteEmail.trim() === '') {
    console.error('❌ Email del cliente no definido');
    return res.status(400).json({ error: 'Email del cliente no definido' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: clienteEmail,
    subject: asunto,
    html: htmlCotizacion
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ mensaje: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
};

export async function enviarEmailDeAlerta({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📨 Alerta enviada a ${to}`);
  } catch (error) {
    console.error('❌ Error al enviar alerta:', error);
    throw error;
  }
}





export async function enviarEmailConAdjunto(req, res) {
  const { clienteEmail, asunto, htmlCotizacion } = req.body;
  const archivoPDF = req.file;

  if (!clienteEmail || !archivoPDF) {
    return res.status(400).json({ error: 'Faltan datos para enviar el correo' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: 'tu_correo@gmail.com',
    to: clienteEmail,
    subject: asunto,
    html: htmlCotizacion,
    attachments: [
      {
        filename: archivoPDF.originalname,
        content: archivoPDF.buffer
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ mensaje: 'Correo enviado con PDF adjunto' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
}