import nodemailer from "nodemailer";


// ─────────────────────────────────────────────────────────────
// SEND OTP EMAIL
// ─────────────────────────────────────────────────────────────

export const sendOTPEmail = async (
  toEmail,
  otp,
  firstName
) => {

  console.log(
    "========== SEND EMAIL DEBUG =========="
  );

  console.log(
    "EMAIL_USER:",
    process.env.EMAIL_USER
  );

  console.log(
    "EMAIL_PASS exists:",
    !!process.env.EMAIL_PASS
  );

  console.log(
    "EMAIL_PASS length:",
    process.env.EMAIL_PASS?.length
  );

  console.log(
    "======================================"
  );


  // ─────────────────────────────────────────
  // Gmail transporter
  // ─────────────────────────────────────────

  const transporter =
    nodemailer.createTransport({

      host: "smtp.gmail.com",

      port: 465,

      secure: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      // Temporary workaround for
      // self-signed certificate error
      tls: {
        rejectUnauthorized: false,
      },

    });


  // ─────────────────────────────────────────
  // Email content
  // ─────────────────────────────────────────

  const mailOptions = {

    from:
      `"Kings Chops" <${process.env.EMAIL_USER}>`,

    to: toEmail,

    subject:
      "Reset Your Kings Chops Password",


    html: `
      <!DOCTYPE html>

      <html>

        <head>

          <meta charset="utf-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

        </head>


        <body
          style="
            margin:0;
            padding:0;
            background:#f9f5f0;
            font-family:Georgia,serif;
          "
        >

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              background:#f9f5f0;
              padding:40px 0;
            "
          >

            <tr>

              <td align="center">


                <table
                  width="520"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background:#ffffff;
                    border-radius:16px;
                    overflow:hidden;
                    box-shadow:
                      0 4px 24px
                      rgba(0,0,0,0.08);
                  "
                >


                  <!-- HEADER -->

                  <tr>

                    <td
                      style="
                        background:#ea580c;
                        padding:32px 40px;
                        text-align:center;
                      "
                    >

                      <p
                        style="
                          margin:0;
                          font-size:28px;
                        "
                      >
                        👑
                      </p>


                      <h1
                        style="
                          margin:8px 0 0;
                          color:#ffffff;
                          font-size:24px;
                          font-family:Georgia,serif;
                        "
                      >

                        Kings
                        <span
                          style="color:#fef08a;"
                        >
                          Chops
                        </span>

                      </h1>


                      <p
                        style="
                          margin:6px 0 0;
                          color:#fed7aa;
                          font-size:13px;
                        "
                      >
                        Password Reset Request
                      </p>

                    </td>

                  </tr>


                  <!-- BODY -->

                  <tr>

                    <td
                      style="
                        padding:36px 40px;
                      "
                    >


                      <p
                        style="
                          margin:0 0 12px;
                          color:#374151;
                          font-size:15px;
                        "
                      >

                        Hi
                        <strong>
                          ${firstName}
                        </strong>
                        👋,

                      </p>


                      <p
                        style="
                          margin:0 0 24px;
                          color:#6b7280;
                          font-size:14px;
                          line-height:1.6;
                        "
                      >

                        We received a request to reset
                        your Kings Chops password.

                        Use the OTP code below
                        to continue.

                        This code expires in
                        <strong>
                          10 minutes
                        </strong>.

                      </p>


                      <!-- OTP BOX -->

                      <div
                        style="
                          background:#fff7ed;
                          border:
                            2px dashed #f97316;
                          border-radius:12px;
                          padding:28px;
                          text-align:center;
                          margin:0 0 24px;
                        "
                      >


                        <p
                          style="
                            margin:0 0 8px;
                            color:#9a3412;
                            font-size:12px;
                            font-weight:bold;
                            letter-spacing:2px;
                            text-transform:uppercase;
                          "
                        >

                          Your OTP Code

                        </p>


                        <p
                          style="
                            margin:0;
                            color:#ea580c;
                            font-size:42px;
                            font-weight:bold;
                            letter-spacing:12px;
                            font-family:monospace;
                          "
                        >

                          ${otp}

                        </p>


                      </div>


                      <p
                        style="
                          margin:0 0 8px;
                          color:#6b7280;
                          font-size:13px;
                        "
                      >

                        ⏱ This code expires in
                        <strong>
                          10 minutes
                        </strong>.

                      </p>


                      <p
                        style="
                          margin:0 0 24px;
                          color:#6b7280;
                          font-size:13px;
                        "
                      >

                        🔒 If you didn't request this,
                        you can safely ignore this email.

                        Your account remains secure.

                      </p>


                      <!-- FOOTER -->

                      <div
                        style="
                          border-top:
                            1px solid #f3f4f6;
                          padding-top:20px;
                          text-align:center;
                        "
                      >

                        <p
                          style="
                            margin:0;
                            color:#9ca3af;
                            font-size:12px;
                          "
                        >

                          ©
                          ${new Date().getFullYear()}
                          Kings Chops · Lagos, Nigeria

                        </p>

                      </div>


                    </td>

                  </tr>


                </table>


              </td>

            </tr>

          </table>

        </body>

      </html>
    `,
  };


  // ─────────────────────────────────────────
  // SEND EMAIL
  // ─────────────────────────────────────────

  await transporter.sendMail(
    mailOptions
  );


  console.log(
    "✅ OTP email sent successfully to:",
    toEmail
  );
};