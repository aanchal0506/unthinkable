import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  await transporter.sendMail({
    from: `"Healthcare Appointment Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

/* ---------------- BOOKING CONFIRMATION ---------------- */

const sendBookingConfirmationToPatient = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  date: Date,
  startTime: string,
  endTime: string
) => {
  await sendEmail(
    patientEmail,
    "Appointment Booking Confirmation",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Appointment Confirmed ✅</h2>

        <p>Hello ${patientName},</p>

        <p>Your appointment has been successfully booked.</p>

        <h3>Appointment Details</h3>

        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${date.toDateString()}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>

        <p>
          Please make sure to be available at the scheduled time.
        </p>

        <hr />

        <p>
          Healthcare Appointment Manager
        </p>
      </div>
    `
  );
};

const sendBookingConfirmationToDoctor = async (
  doctorEmail: string,
  doctorName: string,
  patientName: string,
  date: Date,
  startTime: string,
  endTime: string
) => {
  await sendEmail(
    doctorEmail,
    "New Appointment Booked",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Appointment 📅</h2>

        <p>Hello Dr. ${doctorName},</p>

        <p>A new appointment has been booked.</p>

        <h3>Appointment Details</h3>

        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${date.toDateString()}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>

        <p>
          Please review the patient's information before the consultation.
        </p>

        <hr />

        <p>
          Healthcare Appointment Manager
        </p>
      </div>
    `
  );
};

/* ---------------- CANCELLATION ---------------- */

const sendCancellationToPatient = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  date: Date,
  startTime: string,
  endTime: string
) => {
  await sendEmail(
    patientEmail,
    "Appointment Cancelled",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Appointment Cancelled ❌</h2>

        <p>Hello ${patientName},</p>

        <p>Your appointment has been cancelled.</p>

        <h3>Appointment Details</h3>

        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${date.toDateString()}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>

        <p>
          You can book another appointment through the
          Healthcare Appointment Manager.
        </p>

        <hr />

        <p>
          Healthcare Appointment Manager
        </p>
      </div>
    `
  );
};

const sendCancellationToDoctor = async (
  doctorEmail: string,
  doctorName: string,
  patientName: string,
  date: Date,
  startTime: string,
  endTime: string
) => {
  await sendEmail(
    doctorEmail,
    "Appointment Cancelled",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Appointment Cancelled ❌</h2>

        <p>Hello Dr. ${doctorName},</p>

        <p>The following appointment has been cancelled.</p>

        <h3>Appointment Details</h3>

        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${date.toDateString()}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>

        <p>
          The appointment slot is now available again.
        </p>

        <hr />

        <p>
          Healthcare Appointment Manager
        </p>
      </div>
    `
  );
};

/* ---------------- MEDICATION REMINDER ---------------- */

const sendMedicationReminder = async (
  email: string,
  medication: string,
  dosage: string,
  instructions?: string
) => {
  await sendEmail(
    email,
    `Medication Reminder - ${medication}`,
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Medication Reminder 💊</h2>

        <p>It's time to take your medication.</p>

        <p><strong>Medication:</strong> ${medication}</p>

        <p><strong>Dosage:</strong> ${dosage}</p>

        ${
          instructions
            ? `<p><strong>Instructions:</strong> ${instructions}</p>`
            : ""
        }

        <p>
          Please follow the medication instructions provided
          by your doctor.
        </p>

        <hr />

        <p>
          Healthcare Appointment Manager
        </p>
      </div>
    `
  );
};

export {
  sendBookingConfirmationToPatient,
  sendBookingConfirmationToDoctor,
  sendCancellationToPatient,
  sendCancellationToDoctor,
  sendMedicationReminder,
};