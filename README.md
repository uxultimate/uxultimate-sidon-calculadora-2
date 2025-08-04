
# Sidon Digital Estimator

This is a Next.js application for creating and managing quotes.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [https://9002-firebase-studio-1751837744773.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev/](https://9002-firebase-studio-1751837744773.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev/) with your browser to see the result. Your cloud development environment will provide a public URL for you to access the running application.

## Required Setup: Sending Emails

This application sends emails directly using SMTP. For this to work, you must configure your SMTP provider's credentials within the application.

### Configure SMTP in App Settings

1.  Log in to the application with a **Superadmin** account.
2.  Navigate to **Dashboard -> Ajustes Globales** (Global Settings). You can access this from the User Menu in the top right.
3.  Fill out the **Configuración SMTP** section with the details from your email provider (e.g., SendGrid, Resend, Mailgun).
    *   **Host:** Your provider's SMTP server address (e.g., `smtp.sendgrid.net`).
    *   **Port:** The port number (e.g., `587` or `465`).
    *   **Usuario:** Your SMTP username.
    *   **Contraseña:** Your SMTP password or API key.
    *   **Usar conexión segura (TLS):** Enable this unless your provider specifies otherwise.
4.  Click **Guardar Cambios** (Save Changes).

The application is now ready to send emails.
