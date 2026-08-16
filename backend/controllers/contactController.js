import nodemailer from "nodemailer";

const sendContactMessage = async (req, res) => {
  console.log("CONTACT CONTROLLER REACHED");
  console.log("CONTACT BODY:", req.body);

  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("ABOUT TO VERIFY EMAIL");

    await transporter.verify();

    console.log("EMAIL SERVER CONNECTION SUCCESSFUL");

    const info = await transporter.sendMail({
      from: `"Kings Chops Website" <${process.env.EMAIL_USER}>`,
      to: "kingchops247@gmail.com",
      replyTo: email,
      subject: `Kings Chops Contact: ${subject}`,
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 650px;
          margin: auto;
          padding: 25px;
          background: #faf4ef;
          border-radius: 12px;
        ">
          <h2 style="color: #d65a2a;">
            New Contact Message
          </h2>

          <div style="
            background: white;
            padding: 20px;
            border-radius: 10px;
          ">
            <p>
              <strong>Name:</strong> ${name}
            </p>

            <p>
              <strong>Email:</strong> ${email}
            </p>

            <p>
              <strong>Phone:</strong> ${phone || "Not provided"}
            </p>

            <p>
              <strong>Subject:</strong> ${subject}
            </p>

            <hr />

            <p>
              <strong>Message:</strong>
            </p>

            <p style="color: #555; line-height: 1.6;">
              ${message.replace(/\n/g, "<br />")}
            </p>
          </div>

          <p style="
            font-size: 12px;
            color: #888;
            margin-top: 20px;
          ">
            This message was sent through the Kings Chops website contact form.
          </p>
        </div>
      `,
    });

    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });

  } catch (error) {
    console.error("=================================");
    console.error("CONTACT EMAIL ERROR");
    console.error(error);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      message: "Unable to send message.",
      error: error.message,
    });
  }
};

export default sendContactMessage;