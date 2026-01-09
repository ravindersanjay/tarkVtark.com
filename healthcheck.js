#!/usr/bin/env node

/**
 * ================================================
 * DEBATE APPLICATION - HEALTH CHECK UTILITY
 * ================================================
 * Comprehensive health check for all application components
 * Run: node healthcheck.js
 * ================================================
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

let errorCount = 0;
let warningCount = 0;
let passCount = 0;

// Helper functions
function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}[OK]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    info: `${colors.cyan}[INFO]${colors.reset}`,
  };
  console.log(`${prefix[type] || ''} ${message}`);
}

function header(title) {
  console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}`);
  console.log('-'.repeat(50));
}

function executeCommand(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

function checkFile(filePath, required = true) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log(`${filePath} exists`, 'success');
    passCount++;
    return true;
  } else {
    if (required) {
      log(`${filePath} not found!`, 'error');
      errorCount++;
    } else {
      log(`${filePath} not found`, 'info');
    }
    return false;
  }
}

function checkDirectory(dirPath, required = true) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    log(`${dirPath} directory exists`, 'success');
    passCount++;
    return true;
  } else {
    if (required) {
      log(`${dirPath} directory not found!`, 'error');
      errorCount++;
    } else {
      log(`${dirPath} directory not found`, 'info');
    }
    return false;
  }
}

function testApiEndpoint(url, name) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          log(`${name} endpoint responding (200 OK)`, 'success');
          passCount++;
          resolve({ success: true, data, statusCode: res.statusCode });
        } else {
          log(`${name} endpoint returned ${res.statusCode}`, 'warning');
          warningCount++;
          resolve({ success: false, statusCode: res.statusCode });
        }
      });
    });

    request.on('error', () => {
      log(`${name} endpoint not responding`, 'info');
      resolve({ success: false, error: 'Connection failed' });
    });

    request.setTimeout(5000, () => {
      request.destroy();
      log(`${name} endpoint timeout`, 'info');
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Main health check functions
async function checkSystemRequirements() {
  header('[1/10] System Requirements');

  // Check Node.js
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (nodeMajor >= 18) {
    log(`Node.js ${nodeVersion} installed`, 'success');
    passCount++;
  } else {
    log(`Node.js ${nodeVersion} - Recommend v18+`, 'warning');
    warningCount++;
  }

  // Check Java
  const javaCheck = await executeCommand('java -version');
  if (!javaCheck.error) {
    log('Java installed', 'success');
    passCount++;
  } else {
    log('Java not found! Install Java 17+', 'error');
    errorCount++;
  }

  // Check Maven
  const mavenCheck = await executeCommand('mvn -v');
  if (!mavenCheck.error) {
    log('Maven installed', 'success');
    passCount++;
  } else {
    log('Maven not found! Install Maven 3.8+', 'error');
    errorCount++;
  }

  // Check npm
  const npmCheck = await executeCommand('npm -v');
  if (!npmCheck.error) {
    log('npm installed', 'success');
    passCount++;
  } else {
    log('npm not found!', 'error');
    errorCount++;
  }

  // Check PostgreSQL
  const pgCheck = await executeCommand('psql --version');
  if (!pgCheck.error) {
    log('PostgreSQL installed', 'success');
    passCount++;
  } else {
    log('PostgreSQL not found! Install PostgreSQL 13+', 'error');
    errorCount++;
  }
}

async function checkDatabase() {
  header('[2/10] Database');

  // Check if database exists
  const dbCheck = await executeCommand('psql -U postgres -lqt 2>nul | findstr "debate_db"');
  if (!dbCheck.error && dbCheck.stdout.includes('debate_db')) {
    log('Database "debate_db" exists', 'success');
    passCount++;

    // Check tables
    const tableCheck = await executeCommand(
      'psql -U postgres -d debate_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\';" -t'
    );
    if (tableCheck.stdout && tableCheck.stdout.trim() === '5') {
      log('All 5 tables exist', 'success');
      passCount++;
    } else {
      log('Expected 5 tables, found different count', 'warning');
      warningCount++;
    }

    // Check sample data
    const topicCheck = await executeCommand(
      'psql -U postgres -d debate_db -c "SELECT COUNT(*) FROM debate_topics;" -t'
    );
    const topicCount = parseInt(topicCheck.stdout.trim());
    if (topicCount > 0) {
      log(`${topicCount} topics found in database`, 'success');
      passCount++;
    } else {
      log('No topics found. Database may be empty.', 'warning');
      warningCount++;
    }
  } else {
    log('Database "debate_db" not found! Run setup-database.bat', 'error');
    errorCount++;
  }
}

async function checkBackendFiles() {
  header('[3/10] Backend Files');

  checkDirectory('backend', true);
  checkFile('backend/pom.xml', true);
  checkFile('backend/src/main/java/com/debatearena/DebateApplication.java', true);
  checkFile('backend/src/main/java/com/debatearena/controller/TopicController.java', true);
  checkFile('backend/src/main/java/com/debatearena/controller/QuestionController.java', true);
  checkFile('backend/src/main/java/com/debatearena/controller/ReplyController.java', true);
  checkFile('backend/src/main/resources/application.yml', true);
  checkFile('backend/src/main/java/com/debatearena/config/CorsConfig.java', false);
}

async function checkFrontendFiles() {
  header('[4/10] Frontend Files');

  checkDirectory('frontend', true);
  checkFile('frontend/package.json', true);
  checkFile('frontend/src/App.jsx', true);
  checkFile('frontend/src/components/AdminDashboard.jsx', true);
  checkFile('frontend/src/services/apiService.js', true);
  checkFile('frontend/src/components/DebateTopics.jsx', false);

  if (!checkDirectory('frontend/node_modules', false)) {
    log('Run "cd frontend && npm install" to install dependencies', 'info');
  }
}

async function checkPorts() {
  header('[5/10] Port Availability');

  const netstatCheck = await executeCommand('netstat -ano');

  if (netstatCheck.stdout.includes(':8080')) {
    log('Port 8080 in use (Backend may be running)', 'info');
  } else {
    log('Port 8080 available', 'success');
    passCount++;
  }

  if (netstatCheck.stdout.includes(':5173')) {
    log('Port 5173 in use (Frontend may be running)', 'info');
  } else {
    log('Port 5173 available', 'success');
    passCount++;
  }

  if (netstatCheck.stdout.includes(':5432')) {
    log('Port 5432 in use (PostgreSQL running)', 'success');
    passCount++;
  } else {
    log('Port 5432 not in use (PostgreSQL may not be running)', 'warning');
    warningCount++;
  }
}

async function checkBackendAPI() {
  header('[6/10] Backend API Endpoints');

  // Test topics endpoint
  const topicsTest = await testApiEndpoint('http://localhost:8080/api/v1/topics', 'Topics');

  if (topicsTest.success) {
    try {
      const data = JSON.parse(topicsTest.data);
      if (Array.isArray(data)) {
        log(`Topics endpoint returned ${data.length} topics`, 'success');
        passCount++;
      }
    } catch (e) {
      log('Topics endpoint returned invalid JSON', 'warning');
      warningCount++;
    }

    // Test questions endpoint (if we have topic data)
    if (topicsTest.data) {
      try {
        const topics = JSON.parse(topicsTest.data);
        if (topics.length > 0 && topics[0].id) {
          await testApiEndpoint(
            `http://localhost:8080/api/v1/questions/topic/${topics[0].id}`,
            'Questions'
          );
        }
      } catch (e) {
        // Ignore
      }
    }
  } else {
    log('Backend not running. Start with: cd backend && mvn spring-boot:run', 'info');
  }
}

async function checkConfigurationFiles() {
  header('[7/10] Configuration Files');

  checkFile('database-schema.sql', true);
  checkFile('database-initial-data.sql', true);
  checkFile('setup-database.bat', false);
  checkFile('clean-database.bat', false);

  // Check application.yml for database config
  if (fs.existsSync('backend/src/main/resources/application.yml')) {
    const content = fs.readFileSync('backend/src/main/resources/application.yml', 'utf8');
    if (content.includes('jdbc:postgresql')) {
      log('Database configuration found in application.yml', 'success');
      passCount++;
    } else {
      log('PostgreSQL connection string not found in application.yml', 'warning');
      warningCount++;
    }
  }
}

async function checkBuildArtifacts() {
  header('[8/10] Build Artifacts');

  if (checkDirectory('backend/target', false)) {
    log('Backend has been built', 'success');
  } else {
    log('Backend not built. Run: cd backend && mvn clean compile', 'info');
  }

  if (checkDirectory('frontend/dist', false)) {
    log('Frontend has been built', 'success');
  } else {
    log('Frontend not built. Run: cd frontend && npm run build (if needed)', 'info');
  }
}

async function checkDocumentation() {
  header('[9/10] Documentation');

  checkFile('README.md', false);
  checkFile('DEVELOPMENT_PLAN.md', false);
  checkFile('DATABASE_SCRIPTS_ANALYSIS.md', false);
  checkFile('COMPLETE_CHAT_SESSION_LOG.md', false);
}

async function checkSecurity() {
  header('[10/10] Security Configuration');

  // Check for placeholder password
  if (fs.existsSync('database-initial-data.sql')) {
    const content = fs.readFileSync('database-initial-data.sql', 'utf8');
    if (content.includes('PLACEHOLDER') || content.includes('SECURITY WARNING')) {
      log('Placeholder password found - Replace before production!', 'warning');
      warningCount++;
    } else {
      log('No placeholder password markers found', 'info');
    }
  }

  // Check CORS config
  checkFile('backend/src/main/java/com/debatearena/config/CorsConfig.java', false);
}

function printSummary() {
  console.log('\n');
  console.log('='.repeat(50));
  console.log(`${colors.bright}${colors.cyan}HEALTH CHECK SUMMARY${colors.reset}`);
  console.log('='.repeat(50));
  console.log('');

  const total = passCount + errorCount + warningCount;

  console.log(`${colors.green}Passed:   ${passCount}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warningCount}${colors.reset}`);
  console.log(`${colors.red}Errors:   ${errorCount}${colors.reset}`);
  console.log('');

  if (errorCount === 0) {
    if (warningCount === 0) {
      console.log(`${colors.green}${colors.bright}[SUCCESS] All checks passed! System is healthy.${colors.reset}`);
      console.log('');
      console.log('Your debate application is ready to run!');
    } else {
      console.log(`${colors.yellow}${colors.bright}[PARTIAL] System functional but has ${warningCount} warning(s)${colors.reset}`);
      console.log('');
      console.log('The application should work, but review warnings above.');
    }
  } else {
    console.log(`${colors.red}${colors.bright}[FAILED] Found ${errorCount} error(s) and ${warningCount} warning(s)${colors.reset}`);
    console.log('');
    console.log('Please fix the errors before running the application.');
  }

  console.log('');
  console.log('='.repeat(50));
  console.log(`${colors.bright}QUICK START COMMANDS${colors.reset}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('Start Backend:');
  console.log('  cd backend && mvn spring-boot:run');
  console.log('');
  console.log('Start Frontend:');
  console.log('  cd frontend && npm run dev');
  console.log('');
  console.log('Setup Database:');
  console.log('  setup-database.bat (Windows)');
  console.log('  ./setup-database.sh (Linux/Mac)');
  console.log('');
  console.log('='.repeat(50));
  console.log('');
}

// Main execution
async function main() {
  console.log('');
  console.log('='.repeat(50));
  console.log(`${colors.bright}${colors.cyan}DEBATE APPLICATION HEALTH CHECK${colors.reset}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('Starting comprehensive system check...');

  try {
    await checkSystemRequirements();
    await checkDatabase();
    await checkBackendFiles();
    await checkFrontendFiles();
    await checkPorts();
    await checkBackendAPI();
    await checkConfigurationFiles();
    await checkBuildArtifacts();
    await checkDocumentation();
    await checkSecurity();

    printSummary();

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}Health check failed with error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };

