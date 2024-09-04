export const fillTemplate = (body) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      <h1>Bienvenido a Farm Track</h1>
      <h2>Gracias por unirte</h2>
      <p>Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
      <a href=${process.env.BACKEND_URL}/auth/verify?token=${body.verification_token}>Verificar cuenta</a>
  </body>
  </html>
`;
