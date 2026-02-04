@echo off
echo Installing WhatsApp Web integration...
cd "c:\My Projects\study\ai-companion"
npm install whatsapp-web.js@1.23.0 qrcode-terminal@0.12.0
echo.
echo WhatsApp packages installed successfully!
echo Now restart your AI companion with: npm start
echo.
echo When it starts, you'll see a QR code to scan with your phone.
pause