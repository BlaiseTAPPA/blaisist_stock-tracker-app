// {{appUrl}}: public app URL without a trailing slash (lib/app-url.ts).
import { COLORS } from "../design-tokens";

export const WELCOME_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Welcome to FinGenius</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: ${COLORS.surfaceRaised} !important;
                border: 1px solid ${COLORS.border} !important;
            }
            .dark-bg {
                background-color: ${COLORS.surface} !important;
            }
            .dark-text {
                color: #ffffff !important;
            }
            .dark-text-secondary {
                color: #9ca3af !important;
            }
            .dark-text-muted {
                color: #6b7280 !important;
            }
            .dark-border {
                border-color: ${COLORS.border} !important;
            }
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            .mobile-padding {
                padding: 24px !important;
            }
            .mobile-header-padding {
                padding: 24px 24px 12px 24px !important;
            }
            .mobile-text {
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .mobile-title {
                font-size: 24px !important;
                line-height: 1.3 !important;
            }
            .mobile-button {
                width: 100% !important;
                text-align: center !important;
            }
            .mobile-button a {
                width: calc(100% - 64px) !important;
                display: block !important;
                text-align: center !important;
            }
            .mobile-outer-padding {
                padding: 20px 10px !important;
            }
            .dashboard-preview {
                padding: 0 15px 30px 15px !important;
            }
        }
        @media only screen and (max-width: 480px) {
            .mobile-title {
                font-size: 22px !important;
            }
            .mobile-padding {
                padding: 15px !important;
            }
            .mobile-header-padding {
                padding: 15px 15px 8px 15px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" class="mobile-outer-padding" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; background-color: ${COLORS.surfaceRaised}; border-radius: 8px; border: 1px solid ${COLORS.border};">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td align="left" class="mobile-header-padding" style="padding: 40px 40px 20px 40px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius Logo" width="150" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Dashboard Preview Image -->
                    <tr>
                        <td align="center" class="dashboard-preview" style="padding: 40px 40px 0px 40px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/dashboard-preview.png?updatedAt=1756378548102" alt="FinGenius Dashboard Preview" width="100%" style="max-width: 520px; width: 100%; height: auto; border-radius: 12px; border: 1px solid ${COLORS.border};">
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 40px 40px 40px;">
                            
                            <!-- Welcome Heading -->
                            <h1 class="mobile-title dark-text" style="margin: 0 0 30px 0; font-size: 24px; font-weight: 600; color: #FDD458; line-height: 1.2;">
                                Welcome aboard {{name}}
                            </h1>
                            
                            <!-- Intro Text -->
                            {{intro}}  
                            
                            <!-- Feature List Label -->
                            <p class="mobile-text dark-text-secondary" style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textSecondary}; font-weight: 600;">
                                Here's what you can do right now:
                            </p>
                            
                            <!-- Feature List -->
                            <ul class="mobile-text dark-text-secondary" style="margin: 0 0 30px 0; padding-left: 20px; font-size: 16px; line-height: 1.6; color: ${COLORS.textSecondary};">
                                <li style="margin-bottom: 12px;">Set up your watchlist to follow your favorite stocks</li>
                                <li style="margin-bottom: 12px;">Open interactive TradingView charts, company profiles and financials</li>
                                <li style="margin-bottom: 12px;">Explore the dashboard for trends and the latest market news</li>
                            </ul>
                            
                            <!-- Additional Text -->
                            <p class="mobile-text dark-text-secondary" style="margin: 0 0 40px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textSecondary};">
                                Every day, we'll email you a digest of the market news for the stocks in your watchlist.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 40px 0; width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="{{appUrl}}/" style="display: block; width: 100%; background: linear-gradient(135deg, #FDD458 0%, #E8BA40 100%); color: #000000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 500; line-height: 1; text-align: center; box-sizing: border-box;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Disclaimer: fixed text, outside the AI-generated placeholders -->
                            <p class="mobile-text dark-text-muted" style="margin: 40px 0 0 0; font-size: 12px; line-height: 1.5; color: #9095A1 !important; text-align: center;">
                                This email is for informational purposes only and does not constitute financial advice. Market data may be delayed.
                            </p>
                            <!-- Footer Text -->
                            <p class="mobile-text dark-text-muted" style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important; text-align: center;">
                               FinGenius HQ, Germersheim, GER 76726, Deutshland <br>
                                <a href="{{settingsUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Email settings</a> | 
                                <a href="{{appUrl}}/" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Visit FinGenius</a><br>
                                © 2026 FinGenius
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const NEWS_SUMMARY_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Market News Summary Today</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: ${COLORS.surfaceRaised} !important;
                border: 1px solid ${COLORS.border} !important;
            }
            .dark-bg {
                background-color: ${COLORS.surface} !important;
            }
            .dark-text {
                color: #ffffff !important;
            }
            .dark-text-secondary {
                color: #9ca3af !important;
            }
            .dark-text-muted {
                color: #6b7280 !important;
            }
            .dark-border {
                border-color: ${COLORS.border} !important;
            }
            .dark-cta {
                background-color: #1f2937 !important;
                border: 1px solid #374151 !important;
            }
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            .mobile-padding {
                padding: 24px !important;
            }
            .mobile-header-padding {
                padding: 24px 24px 12px 24px !important;
            }
            .mobile-text {
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .mobile-title {
                font-size: 24px !important;
                line-height: 1.3 !important;
            }
            .mobile-news-title {
                font-size: 16px !important;
                line-height: 1.3 !important;
            }
            .mobile-outer-padding {
                padding: 20px 10px !important;
            }
        }
        @media only screen and (max-width: 480px) {
            .mobile-title {
                font-size: 22px !important;
            }
            .mobile-padding {
                padding: 15px !important;
            }
            .mobile-header-padding {
                padding: 15px 15px 8px 15px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" class="mobile-outer-padding" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; background-color: ${COLORS.surfaceRaised}; border-radius: 8px; border: 1px solid ${COLORS.border};">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td align="left" class="mobile-header-padding" style="padding: 40px 40px 20px 40px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius Logo" width="150" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 40px 40px 40px;">
                            
                            <!-- Header -->
                            <h1 class="mobile-title dark-text" style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #FDD458; line-height: 1.2;">
                                Market News Summary Today
                            </h1>
                            
                            <!-- Date -->
                            <p class="mobile-text dark-text-muted" style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.4; color: #6b7280;">
                                {{date}}
                            </p>
                            
                            <!-- News Summary -->
                            {{newsContent}}
                            
                            <!-- Footer Text -->
                            <div style="text-align: center; margin: 40px 0 0 0;">
                                <!-- Disclaimer: fixed text, outside the AI-generated placeholders -->
                                <p class="mobile-text dark-text-muted" style="margin: 0 0 20px 0; font-size: 12px; line-height: 1.5; color: #9095A1 !important; text-align: center;">
                                    This email is for informational purposes only and does not constitute financial advice. Market data may be delayed.
                                </p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    You're receiving this because the daily news digest is turned on for your FinGenius account.
                                </p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    <a href="{{unsubscribeUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Unsubscribe from the daily digest</a> | 
                                    <a href="{{settingsUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Email settings</a> | 
                                    <a href="{{appUrl}}/" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Visit FinGenius</a>
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    © 2025 FinGenius
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

// The three alert templates and the inactive-user reminder below are not sent
// yet (price alerts are a future feature). Their {{unsubscribeUrl}} must be a
// signed link (lib/email/unsubscribe-token.ts), never "#", and {{appUrl}}
// the public app URL (lib/app-url.ts).
export const STOCK_ALERT_UPPER_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Price Alert: {{symbol}} Hit Upper Target</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: ${COLORS.surfaceRaised} !important;
                border: 1px solid ${COLORS.border} !important;
            }
            .dark-bg {
                background-color: ${COLORS.surface} !important;
            }
            .dark-text {
                color: #ffffff !important;
            }
            .dark-text-secondary {
                color: #9ca3af !important;
            }
            .dark-text-muted {
                color: #6b7280 !important;
            }
            .dark-border {
                border-color: ${COLORS.border} !important;
            }
            .dark-info-box {
                background-color: #1f2937 !important;
                border: 1px solid #374151 !important;
            }
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            .mobile-padding {
                padding: 24px !important;
            }
            .mobile-header-padding {
                padding: 24px 24px 12px 24px !important;
            }
            .mobile-text {
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .mobile-title {
                font-size: 24px !important;
                line-height: 1.3 !important;
            }
            .mobile-button {
                width: 100% !important;
                text-align: center !important;
            }
            .mobile-button a {
                width: calc(100% - 32px) !important;
                display: block !important;
                text-align: center !important;
            }
            .mobile-outer-padding {
                padding: 20px 10px !important;
            }
            .mobile-price {
                font-size: 28px !important;
            }
        }
        @media only screen and (max-width: 480px) {
            .mobile-title {
                font-size: 22px !important;
            }
            .mobile-padding {
                padding: 15px !important;
            }
            .mobile-header-padding {
                padding: 15px 15px 8px 15px !important;
            }
            .mobile-price {
                font-size: 24px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" class="mobile-outer-padding" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; background-color: ${COLORS.surfaceRaised}; border-radius: 8px; border: 1px solid ${COLORS.border};">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td align="left" class="mobile-header-padding" style="padding: 40px 40px 20px 40px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius Logo" width="150" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Alert Header -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px 20px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #059669; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td align="center">
                                        <h1 class="mobile-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                                            📈 Price Above Reached
                                        </h1>
                                        <p style="margin: 0; font-size: 16px; color: #ffffff; opacity: 0.9;">
                                            {{timestamp}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px 40px 40px;">
                            
                            <!-- Stock Info -->
                            <div class="dark-bg" style="text-align: center; padding: 30px 20px; background-color: ${COLORS.surfaceHover}; border-radius: 8px; margin-bottom: 10px;">
                                <h2 class="dark-text" style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                                    {{symbol}}
                                </h2>
                                <p class="dark-text-muted" style="margin: 0 0 20px 0; font-size: 16px; color: #6b7280;">
                                    {{company}}
                                </p>
                                
                                <!-- Current Price -->
                                <div style="margin-bottom: 20px;">
                                    <p class="dark-text-muted" style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Current Price
                                    </p>
                                    <p class="mobile-price" style="margin: 0; font-size: 36px; font-weight: 700; color: #10b981;">
                                        {{currentPrice}}
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Alert Details -->
                            <div class="dark-info-box" style="background-color: ${COLORS.surfaceHover}; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 class="dark-text" style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                                    Alert Details
                                </h3>
                                <p class="mobile-text dark-text-secondary" style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    <strong>Target Price:</strong> {{targetPrice}}
                                </p>
                                <p class="mobile-text dark-text-secondary" style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    <strong>Trigger:</strong> Price exceeded your upper threshold of {{targetPrice}}
                                </p>
                            </div>
                            
                            <!-- Success Message -->
                            <div style="background-color: ${COLORS.surface}; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #E8BA40;">
                                    Opportunity Alert!
                                </h3>
                                <p class="mobile-text" style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary};">
                                    {{symbol}} has reached your target price! This could be a good time to review your position and consider taking profits or adjusting your strategy.
                                </p>
                            </div>
                            
                            <!-- Action Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{appUrl}}/" style="display: block; width: 100%; max-width: 100%; box-sizing: border-box; color: #000000; background-color: #E8BA40; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 500; line-height: 1; text-align: center;">
                                            View Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                             <!-- Footer Text -->
                            <div style="text-align: center; margin: 40px 0 0 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    You're receiving this because you subscribed to FinGenius news updates.
                                </p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    <a href="{{unsubscribeUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Unsubscribe</a> | 
                                    <a href="{{appUrl}}/" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Visit FinGenius</a>
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    © 2025 FinGenius
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const STOCK_ALERT_LOWER_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Price Alert: {{symbol}} Hit Lower Target</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: ${COLORS.surfaceRaised} !important;
                border: 1px solid ${COLORS.border} !important;
            }
            .dark-bg {
                background-color: ${COLORS.surface} !important;
            }
            .dark-text {
                color: #ffffff !important;
            }
            .dark-text-secondary {
                color: #9ca3af !important;
            }
            .dark-text-muted {
                color: #6b7280 !important;
            }
            .dark-border {
                border-color: ${COLORS.border} !important;
            }
            .dark-info-box {
                background-color: #1f2937 !important;
                border: 1px solid #374151 !important;
            }
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            .mobile-padding {
                padding: 24px !important;
            }
            .mobile-header-padding {
                padding: 24px 24px 12px 24px !important;
            }
            .mobile-text {
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .mobile-title {
                font-size: 24px !important;
                line-height: 1.3 !important;
            }
            .mobile-button {
                width: 100% !important;
                text-align: center !important;
            }
            .mobile-button a {
                width: calc(100% - 32px) !important;
                display: block !important;
                text-align: center !important;
            }
            .mobile-outer-padding {
                padding: 20px 10px !important;
            }
            .mobile-price {
                font-size: 28px !important;
            }
        }
        @media only screen and (max-width: 480px) {
            .mobile-title {
                font-size: 22px !important;
            }
            .mobile-padding {
                padding: 15px !important;
            }
            .mobile-header-padding {
                padding: 15px 15px 8px 15px !important;
            }
            .mobile-price {
                font-size: 24px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" class="mobile-outer-padding" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; background-color: ${COLORS.surfaceRaised}; border-radius: 8px; border: 1px solid ${COLORS.border};">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td align="left" class="mobile-header-padding" style="padding: 40px 40px 20px 40px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius Logo" width="150" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Alert Header -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px 20px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #dc2626; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td align="center">
                                        <h1 class="mobile-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                                            📉 Price Below Hit
                                        </h1>
                                        <p style="margin: 0; font-size: 16px; color: #ffffff; opacity: 0.9;">
                                            {{timestamp}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px 40px 40px;">
                            
                            <!-- Stock Info -->
                            <div class="dark-bg" style="text-align: center; padding: 30px 20px; background-color: ${COLORS.surfaceHover}; border-radius: 8px; margin-bottom: 10px;">
                                <h2 class="dark-text" style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                                    {{symbol}}
                                </h2>
                                <p class="dark-text-muted" style="margin: 0 0 20px 0; font-size: 16px; color: #6b7280;">
                                    {{company}}
                                </p>
                                
                                <!-- Current Price -->
                                <div style="margin-bottom: 20px;">
                                    <p class="dark-text-muted" style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Current Price
                                    </p>
                                    <p class="mobile-price" style="margin: 0; font-size: 36px; font-weight: 700; color: #ef4444;">
                                        {{currentPrice}}
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Alert Details -->
                            <div class="dark-info-box" style="background-color: ${COLORS.surfaceHover}; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 class="dark-text" style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                                    Alert Details
                                </h3>
                                <p class="mobile-text dark-text-secondary" style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    <strong>Target Price:</strong> {{targetPrice}}
                                </p>
                                <p class="mobile-text dark-text-secondary" style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    <strong>Trigger:</strong> Price dropped below your lower threshold of {{targetPrice}}
                                </p>
                            </div>
                            
                            <!-- Opportunity Message -->
                            <div style="background-color: ${COLORS.surface}; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #E8BA40;">
                                    Price Dropped
                                </h3>
                                <p class="mobile-text" style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary};">
                                    {{symbol}} dropped below your target price. This might be a good time to buy.
                                </p>
                            </div>
                            
                            <!-- Action Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{appUrl}}/" style="display: block; width: 100%; max-width: 100%; box-sizing: border-box; background-color: #E8BA40; color: #000000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 500; line-height: 1; text-align: center;">
                                            View Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                             <!-- Footer Text -->
                            <div style="text-align: center; margin: 40px 0 0 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    You're receiving this because you subscribed to FinGenius news updates.
                                </p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    <a href="{{unsubscribeUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Unsubscribe</a> | 
                                    <a href="{{appUrl}}/" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Visit FinGenius</a>
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    © 2025 FinGenius
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const VOLUME_ALERT_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Volume Alert: {{symbol}}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: ${COLORS.surfaceRaised} !important;
                border: 1px solid ${COLORS.border} !important;
            }
            .dark-bg {
                background-color: ${COLORS.surface} !important;
            }
            .dark-text {
                color: #ffffff !important;
            }
            .dark-text-secondary {
                color: #9ca3af !important;
            }
            .dark-text-muted {
                color: #6b7280 !important;
            }
            .dark-border {
                border-color: ${COLORS.border} !important;
            }
            .dark-info-box {
                background-color: #1f2937 !important;
                border: 1px solid #374151 !important;
            }
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            .mobile-padding {
                padding: 24px !important;
            }
            .mobile-header-padding {
                padding: 24px 24px 12px 24px !important;
            }
            .mobile-text {
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .mobile-title {
                font-size: 24px !important;
                line-height: 1.3 !important;
            }
            .mobile-outer-padding {
                padding: 20px 10px !important;
            }
            .mobile-volume {
                font-size: 28px !important;
            }
        }
        @media only screen and (max-width: 480px) {
            .mobile-title {
                font-size: 22px !important;
            }
            .mobile-padding {
                padding: 15px !important;
            }
            .mobile-header-padding {
                padding: 15px 15px 8px 15px !important;
            }
            .mobile-volume {
                font-size: 24px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" class="mobile-outer-padding" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; background-color: ${COLORS.surfaceRaised}; border-radius: 8px; border: 1px solid ${COLORS.border};">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td align="left" class="mobile-header-padding" style="padding: 40px 40px 20px 40px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius Logo" width="150" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Alert Header -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px 20px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #7c3aed; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td align="center">
                                        <h1 class="mobile-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                                            📊 Volume Alert
                                        </h1>
                                        <p style="margin: 0; font-size: 16px; color: #ffffff; opacity: 0.9;">
                                            {{timestamp}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px 40px 40px;">
                            
                            <!-- Stock Info -->
                            <div class="dark-bg" style="text-align: center; padding: 30px 20px; background-color: ${COLORS.surface}; border-radius: 8px; margin-bottom: 30px;">
                                <h2 class="dark-text" style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                                    {{symbol}}
                                </h2>
                                <p class="dark-text-muted" style="margin: 0 0 20px 0; font-size: 16px; color: #6b7280;">
                                    {{company}}
                                </p>
                                
                                <!-- Current Volume -->
                                <div style="margin-bottom: 20px;">
                                    <p class="dark-text-muted" style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Current Volume
                                    </p>
                                    <p class="mobile-volume" style="margin: 0; font-size: 36px; font-weight: 700; color: #7c3aed;">
                                        {{currentVolume}}M
                                    </p>
                                </div>
                                
                                <!-- Current Price (smaller) -->
                                <div class="dark-border" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${COLORS.border};">
                                    <p class="dark-text-secondary" style="margin: 0 0 5px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Current Price
                                    </p>
                                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: {{priceColor}};">
                                        {{currentPrice}} ({{changeDirection}}{{changePercent}}%)
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Alert Details -->
                            <div class="dark-info-box" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 class="dark-text" style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                                    Volume Spike Details
                                </h3>
                                <p class="mobile-text dark-text-secondary" style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    <strong>Trigger:</strong> {{alertMessage}}
                                </p>
                                <p class="mobile-text dark-text-secondary" style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    <strong>Average Volume:</strong> {{averageVolume}}M shares
                                </p>
                                <p class="mobile-text dark-text-secondary" style="margin: 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    <strong>Spike Detected:</strong> {{volumeSpike}} above normal trading activity
                                </p>
                            </div>
                            
                            <!-- What This Means -->
                            <div class="dark-info-box" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 class="dark-text" style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                                    💡 What This Means
                                </h3>
                                <p class="mobile-text dark-text-secondary" style="margin: 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
                                    High volume often indicates increased investor interest, potential news events, or significant price movements. This could signal an opportunity to investigate what's driving the activity.
                                </p>
                            </div>
                            
                            <!-- Action Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{appUrl}}/" style="display: inline-block; background-color: #E8BA40; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 500; line-height: 1;">
                                            View Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Disclaimer -->
                            <div class="dark-info-box" style="background-color: #1f2937; border-radius: 6px; padding: 15px; margin-bottom: 20px; border: 1px solid #374151;">
                                <p class="dark-text-muted" style="margin: 0; font-size: 13px; line-height: 1.4; color: #6b7280; text-align: center;">
                                    <strong>Disclaimer:</strong> This alert is for informational purposes only and should not be considered investment advice. High volume doesn't guarantee price direction. Always do your own research before making investment decisions.
                                </p>
                            </div>
                            
                             <!-- Footer Text -->
                            <div style="text-align: center; margin: 40px 0 0 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    You're receiving this because you subscribed to FinGenius news updates.
                                </p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    <a href="{{unsubscribeUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Unsubscribe</a> | 
                                    <a href="{{appUrl}}/" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Visit FinGenius</a>
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    © 2025 FinGenius
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const INACTIVE_USER_REMINDER_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>We Miss You! Your Market Insights Await</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: ${COLORS.surfaceRaised} !important;
                border: 1px solid ${COLORS.border} !important;
            }
            .dark-bg {
                background-color: ${COLORS.surface} !important;
            }
            .dark-text {
                color: #ffffff !important;
            }
            .dark-text-secondary {
                color: #9ca3af !important;
            }
            .dark-text-muted {
                color: #6b7280 !important;
            }
            .dark-border {
                border-color: ${COLORS.border} !important;
            }
            .dark-info-box {
                background-color: #1f2937 !important;
                border: 1px solid #374151 !important;
            }
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            .mobile-padding {
                padding: 24px !important;
            }
            .mobile-header-padding {
                padding: 24px 24px 12px 24px !important;
            }
            .mobile-text {
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .mobile-title {
                font-size: 24px !important;
                line-height: 1.3 !important;
            }
            .mobile-button {
                width: 100% !important;
                text-align: center !important;
            }
            .mobile-button a {
                width: calc(100% - 32px) !important;
                display: block !important;
                text-align: center !important;
            }
            .mobile-outer-padding {
                padding: 20px 10px !important;
            }
        }
        @media only screen and (max-width: 480px) {
            .mobile-title {
                font-size: 22px !important;
            }
            .mobile-padding {
                padding: 15px !important;
            }
            .mobile-header-padding {
                padding: 15px 15px 8px 15px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" class="mobile-outer-padding" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; background-color: ${COLORS.surfaceRaised}; border-radius: 8px; border: 1px solid ${COLORS.border};">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td align="left" class="mobile-header-padding" style="padding: 40px 40px 20px 40px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius Logo" width="150" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 40px 40px 40px;">
                            
                            <!-- Welcome Back Heading -->
                            <h1 class="mobile-title dark-text" style="margin: 0 0 15px 0; font-size: 28px; font-weight: 600; background: linear-gradient(135deg, #FDD458 0%, #E8BA40 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #FDD458; line-height: 1.2;">
                                We Miss You, {{name}}!
                            </h1>
                            
                            <!-- Main Message -->
                            <p class="mobile-text dark-text-secondary" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textSecondary};">
                                We noticed you haven't visited FinGenius in a while. The markets have been moving, and there might be some opportunities you don't want to miss!
                            </p>

                            <!-- Additional Motivation -->
                            <div class="dark-info-box" style="background-color: ${COLORS.surface}; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #E8BA40;">
                                    Market Update
                                </h3>
                                <p class="mobile-text" style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary};">
                                    Markets have been active lately! Major indices have seen significant movements, and there might be opportunities in your tracked stocks that you don't want to miss.
                                </p>
                            </div>
                            
                            <!-- Encouragement Message -->
                            <p class="mobile-text dark-text-secondary" style="margin: 0 0 40px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textSecondary};">
                                Your watchlists are still active and ready to help you stay on top of your investments. Don't let market opportunities pass you by!
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px 0; width: 100%;">
                                <tr>
                                    <td align="center" class="mobile-button">
                                        <a href="{{dashboardUrl}}" style="display: inline-block; background: #E8BA40; color: #000000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 500; line-height: 1; text-align: center;  width: 100%;">
                                            Return to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer Text -->
                            <div style="text-align: center; margin: 40px 0 0 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    Questions? Reply to this email or contact our support team.
                                </p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    <a href="{{unsubscribeUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Unsubscribe</a> | 
                                    <a href="{{dashboardUrl}}" style="color: ${COLORS.textSecondary} !important; text-decoration: underline;">Visit FinGenius</a>
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${COLORS.textSecondary} !important;">
                                    © 2025 FinGenius
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

// Placeholders: {{name}} and {{url}}. Both must be HTML-escaped by the caller.
export const VERIFY_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Verify your email address</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: ${COLORS.surfaceRaised}; border: 1px solid ${COLORS.border}; border-radius: 8px;">
                    <tr>
                        <td style="padding: 32px 32px 0 32px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius" width="130" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px;">
                            <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; line-height: 1.3; color: #FDD458;">
                                Confirm your email address
                            </h1>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textSecondary};">
                                Hi {{name}}, click the button below to verify your email address and activate your FinGenius account. The link expires in 1 hour.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="border-radius: 8px; background-color: #FDD458;">
                                        <a href="{{url}}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 500; color: #000000; text-decoration: none;">
                                            Verify my email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5; color: #9ca3af;">
                                If the button does not work, copy this link into your browser:
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.5; color: #9ca3af; word-break: break-all;">
                                {{url}}
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                                You did not create a FinGenius account? You can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

// Placeholders: {{name}} and {{url}}. Both must be HTML-escaped by the caller.
export const RESET_PASSWORD_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${COLORS.surface};">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: ${COLORS.surfaceRaised}; border: 1px solid ${COLORS.border}; border-radius: 8px;">
                    <tr>
                        <td style="padding: 32px 32px 0 32px;">
                            <img src="https://ik.imagekit.io/a6fkjou7d/logo.png?updatedAt=1756378431634" alt="FinGenius" width="130" style="max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px;">
                            <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; line-height: 1.3; color: #FDD458;">
                                Reset your password
                            </h1>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textSecondary};">
                                Hi {{name}}, we received a request to reset the password of your FinGenius account. Click the button below to choose a new one. The link expires in 1 hour and works once.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="border-radius: 8px; background-color: #FDD458;">
                                        <a href="{{url}}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 500; color: #000000; text-decoration: none;">
                                            Choose a new password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5; color: #9ca3af;">
                                If the button does not work, copy this link into your browser:
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.5; color: #9ca3af; word-break: break-all;">
                                {{url}}
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                                You did not ask for this? You can safely ignore this email: your password stays the same.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
