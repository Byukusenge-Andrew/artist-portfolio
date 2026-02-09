# SSL/HTTPS Configuration Guide

This guide covers SSL setup for both **local development** and **production deployment on Vercel**.

---

## 🔐 Development (Local HTTPS)

### Why HTTPS in Development?

Running your app over HTTPS locally allows you to:
- Test secure authentication flows
- Work with Stripe payments (requires HTTPS)
- Test service workers and PWA features
- Avoid mixed content warnings when using HTTPS APIs (Supabase, Cloudinary)
- Match production environment more closely

### Quick Setup

1. **Generate SSL Certificates**
   ```bash
   npm run generate:certs
   ```
   This creates self-signed certificates in the `certs/` directory:
   - `localhost.key` - Private key
   - `localhost.crt` - SSL certificate

2. **Update Environment Variables**
   
   Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp .env.example .env
   ```
   
   Ensure your `.env` file has:
   ```env
   NEXT_PUBLIC_SITE_URL="https://localhost:3000"
   ```

3. **Start HTTPS Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at: **https://localhost:3000**

### Browser Security Warning

When you first visit `https://localhost:3000`, your browser will show a security warning because the certificate is self-signed.

**This is normal for development!**

To proceed:
- **Chrome/Edge**: Click "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
- **Safari**: Click "Show Details" → "visit this website"

### Alternative: HTTP-Only Development

If you prefer to run without HTTPS locally:
```bash
npm run dev:http
```
This starts the standard Next.js dev server on `http://localhost:3000`

### Optional: HTTP → HTTPS Redirect

To automatically redirect HTTP traffic to HTTPS (for testing), add to your `.env`:
```env
ENABLE_HTTP_REDIRECT="true"
```

This starts an HTTP server on port 3001 that redirects to HTTPS on port 3000.

---

## 🚀 Production (Vercel)

### Automatic SSL on Vercel

**Good news**: Vercel handles SSL automatically! 🎉

When you deploy to Vercel:
1. **Vercel domains** (e.g., `your-app.vercel.app`) get SSL certificates **automatically**
2. **Custom domains** get free SSL certificates via **Let's Encrypt** automatically

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add SSL configuration"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   STRIPE_SECRET_KEY=your-production-stripe-key
   CLOUDINARY_URL=your-cloudinary-url
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```

4. **Redeploy** (if needed)
   ```bash
   git push origin main
   ```
   Or click "Redeploy" in Vercel Dashboard

### Custom Domain SSL

To use your own domain (e.g., `artelier.com`):

1. **Add Domain in Vercel Dashboard**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain name (e.g., `artelier.com`)

2. **Configure DNS**
   
   Vercel will show you DNS records to add at your domain registrar:
   - **A Record**: Point to Vercel's IP address
   - **CNAME**: Or use CNAME for `www` subdomain
   
   Example:
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

3. **Wait for SSL Provisioning**
   - Vercel automatically provisions an SSL certificate via **Let's Encrypt**
   - This usually takes **1-5 minutes**
   - You'll see "SSL Certificate: Active" when ready

4. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SITE_URL=https://artelier.com
   ```

5. **Force HTTPS** (Automatic)
   - Vercel automatically redirects HTTP → HTTPS
   - No additional configuration needed!

### Verify SSL Certificate

After deployment, verify your SSL setup:

1. **Visit your site**: `https://your-app.vercel.app`
2. **Check the padlock icon** in the browser address bar
3. **View certificate details**:
   - Issued by: Let's Encrypt Authority
   - Valid for 90 days (auto-renews)

4. **Test SSL Rating** (optional):
   - Go to [SSL Labs](https://www.ssllabs.com/ssltest/)
   - Enter your domain
   - Should get an **A** or **A+** rating

### Environment-Specific URLs

Make sure your environment variables match your deployment:

**Development** (`.env`):
```env
NEXT_PUBLIC_SITE_URL="https://localhost:3000"
```

**Production** (Vercel Environment Variables):
```env
NEXT_PUBLIC_SITE_URL="https://your-app.vercel.app"
# or
NEXT_PUBLIC_SITE_URL="https://artelier.com"
```

---

## 🔧 Troubleshooting

### Development Issues

**Problem**: Certificate generation fails
```bash
npm run generate:certs
```
**Solution**: Ensure `node-forge` is installed:
```bash
npm install
```

---

**Problem**: "SSL certificates not found" error
**Solution**: Generate certificates first:
```bash
npm run generate:certs
npm run dev
```

---

**Problem**: Browser still shows "Not Secure"
**Solution**: 
- Self-signed certificates will always show a warning in dev
- Click "Advanced" and proceed anyway
- For a trusted certificate, use tools like [mkcert](https://github.com/FiloSottile/mkcert)

---

**Problem**: Port 3000 already in use
**Solution**: 
- Kill the process using port 3000
- Or change port in `.env`:
  ```env
  PORT=3001
  ```

### Production Issues

**Problem**: SSL certificate not provisioning
**Solution**:
1. Check DNS records are correct (can take up to 48 hours to propagate)
2. Verify domain ownership in Vercel
3. Check Vercel deployment logs for errors
4. Contact Vercel support if issue persists

---

**Problem**: Mixed content warnings
**Solution**: Ensure all external resources use HTTPS:
- Update image URLs to use `https://`
- Check API endpoints use HTTPS
- Update any hardcoded HTTP URLs in code

---

**Problem**: Infinite redirect loop
**Solution**:
- Ensure `NEXT_PUBLIC_SITE_URL` uses `https://` in production
- Check middleware isn't forcing redirects
- Verify Vercel settings don't conflict

---

## 📋 Certificate Details

### Development Certificates
- **Type**: Self-signed
- **Algorithm**: RSA 2048-bit
- **Valid for**: 1 year from generation
- **Common Name**: localhost
- **Subject Alternative Names**: localhost, *.localhost, 127.0.0.1, ::1

### Production Certificates (Vercel)
- **Type**: Domain-validated (DV)
- **Issuer**: Let's Encrypt
- **Algorithm**: RSA 2048-bit or ECDSA P-256
- **Valid for**: 90 days (auto-renews)
- **Auto-renewal**: 30 days before expiration

---

## 🔒 Security Best Practices

### Development
- ✅ **Never commit** private keys (`.key` files) to git
- ✅ Regenerate certificates periodically
- ✅ Use HTTPS for testing payment integrations
- ✅ Keep `node-forge` updated

### Production
- ✅ **Always use environment variables** for sensitive data
- ✅ Enable HSTS (Vercel does this automatically)
- ✅ Use strong JWT secrets (32+ random characters)
- ✅ Verify SSL certificate before launch
- ✅ Monitor certificate expiration (Vercel handles this)
- ✅ Use secure cookies (`secure: true, sameSite: 'strict'`)

---

## 📚 Additional Resources

- [Vercel SSL Documentation](https://vercel.com/docs/concepts/projects/custom-domains#ssl)
- [Let's Encrypt](https://letsencrypt.org/)
- [SSL Labs Testing](https://www.ssllabs.com/ssltest/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Need help?** Open an issue on GitHub or check the [README](./README.md) for more information.
