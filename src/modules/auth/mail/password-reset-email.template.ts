/** Escapa `&` y comillas para atributo `href` y texto HTML. */
function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function buildPasswordResetEmailHtml(resetLink: string): string {
  const href = escapeHtmlAttr(resetLink);
  const linkVisible = resetLink.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar contraseña — Campusly</title>
</head>
<body style="margin:0; padding:0; background-color:#F2F4F7; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:20px; padding:40px 35px;">
          <tr>
            <td align="center">
              <h1 style="margin:0; font-size:26px; font-weight:600; color:#0F766E;">
                Restablece tu contraseña
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:16px;">
              <p style="margin:0; font-size:15px; color:#6B7280; line-height:1.6; max-width:400px;">
                Recibimos una solicitud para recuperar tu contraseña de Campusly.
                Haz clic en el botón para continuar.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:30px;">
              <a href="${href}"
                style="background:#0F766E; color:#FFFFFF; text-decoration:none;
                padding:14px 28px; border-radius:999px; font-size:15px;
                font-weight:600; display:inline-block;">
                Restablecer contraseña
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:25px;">
              <p style="font-size:13px; color:#9CA3AF; margin:0;">
                O copia y pega este enlace en tu navegador:
              </p>
              <p style="font-size:13px; color:#111827; word-break:break-all; margin-top:8px;">
                ${linkVisible}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:30px;">
              <p style="font-size:13px; color:#6B7280; line-height:1.5; margin:0;">
                Este enlace expirará en 15 minutos.
              </p>
              <p style="font-size:13px; color:#6B7280; line-height:1.5; margin-top:8px;">
                Si no solicitaste este cambio, ignora este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
