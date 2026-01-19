# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 5.0.x   | :white_check_mark: |
| < 5.0   | :x:                |

## Reporting a Vulnerability

We take the security of NEXAI OMNI-PRIME seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please DO:

1. **Email us directly** at: gokhanturkmeen@gmail.com
2. **Provide detailed information** including:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

### What to expect:

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We will keep you informed about the progress of fixing the vulnerability
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)
- **Timeline**: We aim to address critical vulnerabilities within 7 days

## Security Best Practices

### For Users

- **Keep dependencies updated**: Regularly update to the latest version
- **Secure API keys**: Never commit API keys or secrets to version control
- **Use environment variables**: Store sensitive data in environment variables
- **Review permissions**: Only grant necessary permissions to the application

### For Contributors

- **Code review**: All code changes undergo security review
- **Dependency scanning**: We use automated tools to scan for vulnerable dependencies
- **Input validation**: Always validate and sanitize user input
- **Authentication**: Follow OAuth 2.0 best practices
- **Data encryption**: Sensitive data must be encrypted at rest and in transit

## Known Security Considerations

### API Keys

This project requires API keys for:
- Ollama/Gemini AI services
- Cloudflare Workers deployment

**Important**: Never commit API keys to the repository. Use environment variables or secrets management.

### User Data

- **Personality data**: Stored locally by default
- **Privacy**: Users control their data
- **Anonymization**: Personal information is anonymized in analytics
- **GDPR compliance**: Users can request data deletion

### Third-Party Services

We integrate with:
- **Ollama**: Local AI inference
- **Google Gemini**: Cloud AI services
- **Cloudflare**: Hosting and CDN

Please review their security policies:
- [Ollama Security](https://ollama.ai/security)
- [Google Cloud Security](https://cloud.google.com/security)
- [Cloudflare Security](https://www.cloudflare.com/trust-hub/)

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- Release notes
- Project README

Subscribe to repository notifications to stay informed.

## Vulnerability Disclosure Policy

We follow responsible disclosure principles:

1. **Report received**: Vulnerability reported privately
2. **Validation**: We validate and assess the severity
3. **Fix development**: We develop and test a fix
4. **Release**: Security patch released
5. **Disclosure**: Public disclosure after fix is available
6. **Credit**: Reporter credited (if desired)

## Security Hall of Fame

We appreciate security researchers who help keep NEXAI OMNI-PRIME secure. Contributors who report valid security issues will be listed here (with permission):

*No security issues reported yet*

## Contact

For security concerns, contact:
- **Email**: gokhanturkmeen@gmail.com
- **GitHub**: [@turkmen-coder](https://github.com/turkmen-coder)

---

Thank you for helping keep NEXAI OMNI-PRIME and our users safe! 🔒
