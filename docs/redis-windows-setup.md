# Redis Setup for Windows - Duchess Pastries

This guide will help you install and configure Redis on Windows for the checkout system.

## 🚀 Quick Installation

### Option 1: Automated Setup (Recommended)

```cmd
# Run the Windows-specific setup script
npm run setup:redis:windows

# Or run the batch file directly
scripts\install-redis-windows.bat
```

### Option 2: Manual Installation

#### Step 1: Download Redis for Windows

1. Go to: https://github.com/microsoftarchive/redis/releases
2. Download the latest `Redis-x64-*.zip` file
3. Extract to `C:\Redis\`

#### Step 2: Add to PATH

1. Open **System Properties** → **Environment Variables**
2. Edit the **PATH** variable
3. Add: `C:\Redis\`
4. Click **OK** to save

#### Step 3: Start Redis

```cmd
# Open Command Prompt as Administrator
cd C:\Redis
redis-server.exe
```

#### Step 4: Test Installation

```cmd
# In a new Command Prompt
redis-cli ping
# Should return: PONG
```

## 🐳 Alternative: Docker Installation

If you have Docker installed:

```cmd
# Start Redis container
docker run -d -p 6379:6379 --name redis redis:latest

# Test connection
docker exec -it redis redis-cli ping
```

## 🍫 Using Chocolatey (If Available)

If you have Chocolatey package manager:

```cmd
# Install Redis
choco install redis-64 -y

# Start Redis
redis-server
```

## 🔧 Configuration

### Environment Variables

Create or update `.env.local`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Enable Redis features
REDIS_ENABLE_CHECKOUT_SESSIONS=true
REDIS_ENABLE_DELIVERY_CACHE=true
REDIS_ENABLE_COUPON_CACHE=true
REDIS_ENABLE_USER_SESSIONS=true
REDIS_ENABLE_STATISTICS=true
```

### Windows Service (Optional)

To run Redis as a Windows service:

1. Download **NSSM** (Non-Sucking Service Manager)
2. Install Redis as a service:
   ```cmd
   nssm install Redis C:\Redis\redis-server.exe
   nssm start Redis
   ```

## 🧪 Testing the Installation

### 1. Test Redis Connection

```cmd
# Test basic connection
redis-cli ping

# Test with data
redis-cli set test "Hello Redis"
redis-cli get test
```

### 2. Test Application Integration

```cmd
# Start your development server
npm run dev

# Test Redis health endpoint
curl http://localhost:3000/api/redis/health
```

### 3. Run Integration Tests

```cmd
# Run Redis integration tests
npm run test:redis
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "redis-cli is not recognized"

**Solution:**

- Add `C:\Redis\` to your PATH environment variable
- Restart Command Prompt
- Or use full path: `C:\Redis\redis-cli.exe`

#### 2. "Could not connect to Redis"

**Solution:**

- Make sure Redis server is running: `redis-server.exe`
- Check if port 6379 is available
- Try: `netstat -an | findstr 6379`

#### 3. "Redis server won't start"

**Solution:**

- Run Command Prompt as Administrator
- Check if another Redis instance is running
- Check Windows Firewall settings

#### 4. "Permission denied"

**Solution:**

- Run Command Prompt as Administrator
- Check file permissions in `C:\Redis\`
- Ensure Redis files are not blocked by antivirus

### Debug Commands

```cmd
# Check if Redis is running
tasklist | findstr redis

# Check Redis logs
type C:\Redis\redis.log

# Check port usage
netstat -an | findstr 6379

# Test Redis connection
telnet localhost 6379
```

## 🚀 Production Setup

### For Production Use

1. **Use a Managed Redis Service:**

   - AWS ElastiCache
   - Azure Cache for Redis
   - Redis Cloud

2. **Configure Security:**

   ```env
   REDIS_PASSWORD=your-secure-password
   REDIS_HOST=your-redis-cluster.cache.amazonaws.com
   ```

3. **Enable SSL/TLS:**
   ```env
   REDIS_TLS=true
   REDIS_CERT_PATH=path/to/cert.pem
   ```

## 📊 Performance Monitoring

### Redis Commands for Monitoring

```cmd
# Check Redis info
redis-cli info

# Check memory usage
redis-cli info memory

# Check connected clients
redis-cli info clients

# Monitor Redis commands
redis-cli monitor
```

### Application Health Check

```cmd
# Check application Redis health
curl http://localhost:3000/api/redis/health

# Get Redis statistics
curl -X POST http://localhost:3000/api/redis/cleanup \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"get_stats\"}"
```

## 🔄 Maintenance

### Regular Tasks

1. **Clean up expired sessions:**

   ```cmd
   curl -X POST http://localhost:3000/api/redis/cleanup \
     -H "Content-Type: application/json" \
     -d "{\"action\": \"cleanup_expired\"}"
   ```

2. **Monitor Redis performance:**

   ```cmd
   redis-cli info stats
   ```

3. **Backup Redis data (if needed):**
   ```cmd
   redis-cli bgsave
   ```

## 🆘 Getting Help

### If Redis Won't Start

1. Check Windows Event Viewer for errors
2. Try running Redis in verbose mode:

   ```cmd
   redis-server.exe --verbose
   ```

3. Check if port 6379 is in use:
   ```cmd
   netstat -an | findstr 6379
   ```

### If Application Can't Connect

1. Verify Redis is running:

   ```cmd
   redis-cli ping
   ```

2. Check firewall settings
3. Verify environment variables in `.env.local`
4. Test with Redis CLI first

### Support Resources

- [Redis Documentation](https://redis.io/documentation)
- [Redis for Windows](https://github.com/microsoftarchive/redis)
- [Docker Redis](https://hub.docker.com/_/redis)
- [Windows Redis Setup](https://redis.io/docs/getting-started/installation/install-redis-on-windows/)

## ✅ Verification Checklist

- [ ] Redis server is running (`redis-cli ping` returns `PONG`)
- [ ] Redis is accessible from application
- [ ] Health endpoint returns `200 OK`
- [ ] Integration tests pass
- [ ] Environment variables are set correctly
- [ ] Redis logs show no errors

Once all items are checked, your Redis setup is complete and ready for production use!
