export const fillTemplate = (body) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Verification - BD Metrics</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
              color: #333;
              height: 100%;
              width: 100%;
          }
          table {
              border-spacing: 0;
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
          }
          table td {
              border-collapse: collapse;
          }
          .container-table {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              border-spacing: 0;
          }
          .main-container {
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 600px;
          }
          .header {
              background-color: #487632;
              padding: 20px;
              text-align: center;
          }
          .header img {
              max-width: 150px;
              height: auto;
          }
          .content {
              padding: 30px;
              text-align: center;
          }
          h1 {
              color: #487632;
              font-size: 24px;
              margin-bottom: 10px;
              font-weight: bold;
          }
          h2 {
              color: #555;
              font-size: 18px;
              margin-bottom: 20px;
              font-weight: normal;
          }
          p {
              font-size: 16px;
              line-height: 1.5;
              margin-bottom: 25px;
              color: #555;
          }
          .button {
              display: inline-block;
              background-color: #487632;
              color: white !important;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 5px;
              font-weight: bold;
              font-size: 16px;
              margin: 15px 0;
          }
          .footer {
              background-color: #f5f5f5;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #777;
          }
      </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
      <!-- Wrapper table for better email client compatibility -->
      <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
              <td align="center" valign="middle" style="padding: 20px 0;">
                  <!-- Main content container -->
                  <table class="container-table" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                          <td align="center">
                              <table class="main-container" cellpadding="0" cellspacing="0" border="0" align="center">
                                  <tr>
                                      <td class="header" align="center" bgcolor="#487632" style="padding: 20px; text-align: center;">
                                       
                                      </td>
                                  </tr>
                                  <tr>
                                      <td class="content" align="center" style="padding: 30px; text-align: center;">
                                       <!-- Logo image -->
                                          <img src="https://res.cloudinary.com/dpcbpbhgl/image/upload/v1748273520/main-icon_pzuvdr.png" alt="BD Metrics Logo" style="max-width: 120px; height: auto; margin-bottom: 20px;">
                                          <h1 style="color: #487632; font-size: 24px; margin-bottom: 10px;">Welcome to BD Metrics!</h1>
                                          <h2 style="color: #555; font-size: 18px; margin-bottom: 20px;">Thank you for joining our platform</h2>
                                          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #555;">We are very happy to have you with us. To start using all BD Metrics services, please verify your account by clicking the button below:</p>
                                          <a href="${process.env.BACKEND_URL}/auth/verify?token=${body.verification_token}" class="button" style="background-color: #487632; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; font-size: 16px; margin: 15px 0; display: inline-block;">Verify my account</a>
                                          <p style="font-size: 14px; margin-top: 30px; line-height: 1.5; color: #555;">If you have trouble with the button, you can copy and paste the following link into your browser:</p>
                                          <p style="font-size: 12px; color: #777; word-break: break-all; line-height: 1.5;">${process.env.BACKEND_URL}/auth/verify?token=${body.verification_token}</p>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td class="footer" align="center" bgcolor="#f5f5f5" style="padding: 15px; text-align: center; font-size: 12px; color: #777;">
                                          <p style="margin: 0;">&copy; ${new Date().getFullYear()} BD Metrics. All rights reserved.</p>
                                          <p style="margin: 5px 0 0;">This email was sent because someone registered this address on BD Metrics. If it wasn't you, you can ignore this message.</p>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
`;
