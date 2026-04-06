# 🔒 Security & IP Protection Guide

This document explains the security mechanisms implemented to protect intellectual property while allowing interviewers to evaluate the codebase.

---

## ⚠️ Important Notice

This software is provided **for interview evaluation purposes only**. The security mechanisms described here are designed to:

- ✅ Allow full functionality during the evaluation period
- ✅ Prevent unauthorized production deployment
- ✅ Protect intellectual property
- ✅ Provide a clear trial boundary

---

## 🔐 Security Mechanisms

### 1. Time-Bomb Mechanism

**What it does:**
- Services automatically expire after **7 days** from first initialization
- Prevents long-term unauthorized use

**How it works:**
```typescript
// On first run, creates a timestamp
const config = {
  initializedAt: new Date().toISOString(), // e.g., "2024-01-15T10:30:00Z"
  // ... other config
};

// On each startup, checks if expired
const expiresAt = new Date(initializedAt);
expiresAt.setDate(expiresAt.getDate() + 7); // +7 days

if (now > expiresAt) {
  this.triggerSecurityLock('Trial period expired');
}
```

**User Experience:**
```
🔒 Security validated - 5 days remaining in trial
```

When expired:
```
🚫 SECURITY LOCK: Trial period expired
This assessment is for interview evaluation only.
Contact: dukor.unique@gmail.com for production licensing.
```

---

### 2. Interview Mode Flag

**What it does:**
- A boolean flag that must be `true` for services to run
- Can be easily disabled for demo by the owner
- Prevents accidental production deployment

**How it works:**
```typescript
interface SecurityConfig {
  interviewMode: boolean;  // Must be true
  initializedAt: string;
  instanceId: string;
  checksum: string;
}

// Validation
if (!this.config.interviewMode) {
  this.triggerSecurityLock('Invalid deployment mode');
}
```

**For Interviewers:**
- No action required - flag is set automatically
- Services will run normally during evaluation

**For Owner (Demo Mode):**
- Can be disabled by modifying the config file (see "Disabling Security")

---

### 3. Configuration Checksum

**What it does:**
- Detects tampering with the security configuration
- Ensures config file integrity

**How it works:**
```typescript
// Calculate checksum from config data
private calculateChecksum(config: Omit<SecurityConfig, 'checksum'>): string {
  const data = `${config.interviewMode}-${config.initializedAt}-${config.instanceId}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

// Validate on load
const expectedChecksum = this.calculateChecksum(rest);
if (checksum !== expectedChecksum) {
  this.triggerSecurityLock('Configuration tampering detected');
}
```

**Security:**
- SHA-256 hash ensures tampering is detected
- Any modification to config values invalidates the checksum

---

### 4. Environment Fingerprinting

**What it does:**
- Creates a unique fingerprint of the environment
- Detects if the code is moved to a different machine

**How it works:**
```typescript
private generateFingerprint(): string {
  const machineData = `${process.platform}-${process.arch}-${JSON.stringify(process.env)}`;
  return crypto.createHash('sha256').update(machineData).digest('hex').substring(0, 16);
}
```

**Interview Mode Behavior:**
```typescript
// Relaxed check for interview - only logs warning
if (this.config.instanceId !== this.INSTANCE_FINGERPRINT) {
  this.logger.warn('Environment change detected - Relaxed check for interview');
  // Does NOT block execution
}
```

**Why relaxed?**
- Interviewers may switch machines
- Docker containers have different environments
- CI/CD pipelines need flexibility

---

### 5. Obfuscated Validation

**What it does:**
- Security checks are scattered throughout the codebase
- Makes it harder to locate and remove all checks

**Implementation:**
```typescript
// Check 1: In SecurityService.onModuleInit()
this.performSecurityChecks();

// Check 2: In SecurityGuard.canActivate()
const status = this.securityService.getSecurityStatus();
if (!status.valid) return false;

// Check 3: In main.ts before bootstrap
// (Implicit through SecurityModule)

// Check 4: In service methods
// (Can be added to critical operations)
```

**Benefits:**
- Multiple points of failure if one check is bypassed
- Harder to find all checks
- Distributed validation logic

---

## 📁 Security Configuration File

### Location

```
<service-directory>/.assessment-lock
```

Example:
```
apps/user-service/.assessment-lock
apps/wallet-service/.assessment-lock
```

### Format

The file is **base64-encoded JSON**:

```json
{
  "interviewMode": true,
  "initializedAt": "2024-01-15T10:30:00.000Z",
  "instanceId": "a1b2c3d4e5f67890",
  "checksum": "abc123..."
}
```

### File Permissions

```typescript
fs.writeFileSync(configPath, encoded, { mode: 0o600 });
// 0o600 = Owner read/write only
```

---

## 🛡️ Disabling Security (For Demo)

**⚠️ Warning:** Only for demonstration purposes by the owner.

### Method 1: Delete Config File

```bash
# Remove the lock file to reset the trial
cd apps/user-service
rm .assessment-lock

cd ../wallet-service
rm .assessment-lock

# Restart services - new 7-day trial begins
```

### Method 2: Modify Interview Mode

```bash
# Decode the config file
cd apps/user-service
cat .assessment-lock | base64 -d > config.json

# Edit to disable interview mode
# Change: "interviewMode": true
# To:     "interviewMode": false

# Re-encode
cat config.json | base64 > .assessment-lock
rm config.json
```

### Method 3: Environment Override (If Implemented)

```bash
# Set environment variable (if your implementation supports it)
export ASSESSMENT_MODE=demo

# Start services
npm run start:dev
```

---

## 🔍 Security Audit Checklist

For security reviewers:

- [ ] Time-bomb mechanism is active
- [ ] Interview mode flag is enforced
- [ ] Checksum validation is implemented
- [ ] Config file has restricted permissions
- [ ] Security checks are distributed
- [ ] Error messages don't expose implementation details
- [ ] Graceful shutdown on security lock

---

## 📝 Legal Notice

```
INTELLECTUAL PROPERTY NOTICE
═══════════════════════════════════════════════════════════════

This software and associated documentation files (the "Software") 
are the exclusive property of the Assessment Team.

PERMITTED USE:
- Interview evaluation and assessment
- Code review and technical discussion
- Educational purposes related to the interview

PROHIBITED USE:
- Production deployment
- Commercial use
- Redistribution
- Modification and reuse in other projects
- Removal of security mechanisms

The Software is provided "AS IS" for evaluation purposes only.

For licensing inquiries: interview@assessment.local
═══════════════════════════════════════════════════════════════
```

---

## 🎯 For Interviewers

### What You Can Do

✅ Run the services locally  
✅ Review all source code  
✅ Run automated tests  
✅ Modify code for testing  
✅ Deploy to your local Docker  
✅ Use for technical discussion  

### What You Cannot Do

❌ Deploy to production  
❌ Use in commercial projects  
❌ Redistribute the code  
❌ Remove security mechanisms  
❌ Use beyond the trial period  

### If You Need More Time

Contact the assessment team to:
- Extend the trial period
- Get a demo build without security
- Discuss licensing options

---

## 🔧 Troubleshooting Security Issues

### Issue: "Trial period expired" on first run

**Cause:** Clock skew or pre-existing config file

**Solution:**
```bash
# Remove the lock file and restart
rm apps/user-service/.assessment-lock
rm apps/wallet-service/.assessment-lock
```

### Issue: "Configuration tampering detected"

**Cause:** Config file was manually edited

**Solution:**
```bash
# Delete and let it regenerate
rm apps/user-service/.assessment-lock
# Restart service - new config will be created
```

### Issue: Services won't start (no error message)

**Cause:** Security lock triggered but error not visible

**Solution:**
```bash
# Run with verbose logging
DEBUG=* npm run start:dev
```

---

## 📊 Security Metrics

| Mechanism | Effectiveness | User Impact |
|-----------|--------------|-------------|
| Time-bomb | High | Low (7 days is generous) |
| Interview Mode | Medium | None (automatic) |
| Checksum | Medium | None (background) |
| Fingerprint | Low | None (relaxed in interview) |
| Obfuscation | Medium | None (transparent) |

---

## 💡 Recommendations for Production

If licensing this code for production:

1. **Remove Security Package**
   ```bash
   # Remove from package.json dependencies
   # Remove SecurityModule imports
   # Delete packages/security/
   ```

2. **Add Real Security**
   - API key authentication
   - JWT tokens for user auth
   - Rate limiting
   - Input sanitization
   - Audit logging

3. **Environment Configuration**
   - Use proper secret management (AWS Secrets Manager, etc.)
   - Separate configs per environment
   - Encrypt sensitive data

---

## 📞 Contact

For security concerns or licensing:

- **Email:** dukor.unique@gmail.com
- **Subject:** [Assessment] Security/Licensing Inquiry

---

<p align="center">
  <strong>Protected by Assessment Security Layer 🔒</strong><br>
  <em>For interview evaluation only</em>
</p>
