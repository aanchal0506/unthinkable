import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMedicationReminder = async (
  email: string,
  medication: string,
  dosage: string,
  instructions?: string
) => {
  await transporter.sendMail({
    from: `"Healthcare Appointment Manager" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Medication Reminder - ${medication}`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>💊 Medication Reminder</h2>

        <p>It's time to take your medication.</p>

        <p>
          <strong>Medication:</strong> ${medication}
        </p>

        <p>
          <strong>Dosage:</strong> ${dosage}
        </p>

        ${
          instructions
            ? `
              <p>
                <strong>Instructions:</strong> ${instructions}
              </p>
            `
            : ""
        }

        <p>
          Please follow the medication instructions provided
          by your doctor.
        </p>

        <hr />

        <p style="color: #666;">
          Healthcare Appointment Manager
        </p>
      </div>
    `,
  });
};

export {
  sendMedicationReminder,
};