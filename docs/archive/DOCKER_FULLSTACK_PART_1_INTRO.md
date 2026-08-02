# 🚀 Part 1: Introduction & Prerequisites
## Understanding Docker & Setting Up Your Environment

**Time Required:** 1-2 hours  
**Difficulty:** Easy  
**Prerequisites:** None - This is the starting point!

---

## 📚 What You'll Learn in This Part

1. What is Docker and why we use it
2. Understanding containers vs virtual machines
3. Installing Docker Desktop
4. Installing other required tools
5. Creating cloud platform accounts
6. Verifying everything works
7. Running your first Docker container

---

## 🎯 What is Docker? (Simple Explanation)

### The Problem Docker Solves

Imagine you built an app on your computer and it works perfectly. You share it with a friend, but on their computer, it doesn't work because:
- They have a different operating system
- They have different versions of software installed
- Their configuration is different

**This is called "It works on my machine" problem.**

### The Docker Solution

Docker packages your application with EVERYTHING it needs into a "container":
- Your code
- Required software (Java, Node.js, etc.)
- Configuration files
- Dependencies

**Result:** The container works the same on ANY computer!

### Real-World Analogy

Think of Docker like shipping containers:

**Without Docker** (Old Way):
- Pack items individually
- Different sizes, different handling
- Hard to move between trucks/ships
- Items might break during transfer

**With Docker** (New Way):
- Everything packed in standard containers
- Same size, same handling
- Easy to move anywhere
- Protected and organized

---

## 🆚 Containers vs Virtual Machines

### Virtual Machine (Old Way)

```
┌─────────────────────────────────────┐
│        Your Computer                │
├─────────────────────────────────────┤
│     Operating System (Windows)      │
├─────────────────────────────────────┤
│      Virtualization Software        │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐          │
│  │   VM 1  │  │   VM 2  │          │
│  │ Linux   │  │ Linux   │          │
│  │ Full OS │  │ Full OS │ Heavy!   │
│  │ 2GB RAM │  │ 2GB RAM │          │
│  │ App 1   │  │ App 2   │          │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

**Problems:**
- Each VM needs full operating system
- Uses lots of RAM and disk space
- Slow to start (minutes)
- Heavy resource usage

### Docker Container (New Way)

```
┌─────────────────────────────────────┐
│        Your Computer                │
├─────────────────────────────────────┤
│     Operating System (Windows)      │
├─────────────────────────────────────┤
│          Docker Engine              │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │ App 1│ │ App 2│ │ App 3│ Light!  │
│ │+Deps │ │+Deps │ │+Deps │         │
│ └──────┘ └──────┘ └──────┘         │
└─────────────────────────────────────┘
```

**Benefits:**
- Share the host OS
- Uses much less RAM and disk
- Starts in seconds
- Lightweight and fast

---

## 🔑 Key Docker Concepts (Explained Simply)

### 1. Docker Image

**What:** A blueprint/template for your application

**Analogy:** Like a recipe for a cake
- Lists all ingredients (dependencies)
- Lists all steps (commands)
- Can share the recipe with others

**Example:**
```dockerfile
FROM node:18
COPY . /app
RUN npm install
CMD ["npm", "start"]
```

### 2. Docker Container

**What:** A running instance of an image

**Analogy:** The actual cake made from the recipe
- Image is the recipe
- Container is the baked cake
- You can make many cakes from one recipe

**Example:**
```bash
docker run my-app-image  # Creates and runs a container
```

### 3. Dockerfile

**What:** A file with instructions to build an image

**Analogy:** The written recipe card

**Example:**
```dockerfile
# Start with base image
FROM java:17

# Copy our code
COPY . /app

# Build the app
RUN mvn clean package

# Run the app
CMD ["java", "-jar", "app.jar"]
```

### 4. Docker Compose

**What:** Tool to run multiple containers together

**Analogy:** A full meal recipe (not just one dish)
- Appetizer (Database container)
- Main course (Backend container)
- Dessert (Frontend container)

**Example:**
```yaml
services:
  database:
    image: postgres
  backend:
    build: ./backend
  frontend:
    build: ./frontend
```

---

## 💻 Installing Required Tools

### Step 1: Install Docker Desktop

**What it does:** Runs Docker on your computer

#### Windows Installation

1. **Download Docker Desktop**
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - File size: ~500MB

2. **Run Installer**
   - Double-click `Docker Desktop Installer.exe`
   - Follow installation wizard
   - **Important:** Enable "Use WSL 2" when prompted

3. **Restart Computer**
   - Required for Docker to work properly

4. **Start Docker Desktop**
   - Launch Docker Desktop from Start menu
   - Wait for Docker icon in system tray
   - Icon should turn green (running)

#### macOS Installation

1. **Download Docker Desktop**
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Mac"
   - Choose:
     - **Intel Chip:** if Mac is from 2019 or earlier
     - **Apple Chip:** if Mac is M1/M2/M3 (2020+)

2. **Install**
   - Open downloaded `.dmg` file
   - Drag Docker icon to Applications folder
   - Open Docker from Applications

3. **Grant Permissions**
   - Docker needs system permissions
   - Click "OK" when prompted

#### Linux Installation

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
```

#### Verify Docker Installation

Open terminal/command prompt and run:

```bash
docker --version
```

**Expected output:**
```
Docker version 24.0.x, build xxxxx
```

```bash
docker-compose --version
```

**Expected output:**
```
Docker Compose version v2.23.x
```

**Test Docker:**
```bash
docker run hello-world
```

**Expected output:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

**✅ If you see this, Docker is working!**

---

### Step 2: Install Node.js

**What it does:** Runs JavaScript code (needed for React)

1. **Download Node.js**
   - Go to: https://nodejs.org
   - Download "LTS" version (Long Term Support)
   - Current LTS: v20.x.x

2. **Install**
   - Run downloaded installer
   - Click "Next" through wizard
   - Accept license agreement
   - Install with default settings

3. **Verify Installation**

```bash
node --version
```

**Expected output:**
```
v20.11.0 (or similar)
```

```bash
npm --version
```

**Expected output:**
```
10.2.4 (or similar)
```

---

### Step 3: Install Java JDK

**What it does:** Runs Java code (needed for Spring Boot)

1. **Download Adoptium JDK 17**
   - Go to: https://adoptium.net
   - Select: JDK 17 (LTS)
   - Choose your operating system
   - Download and install

2. **Verify Installation**

```bash
java --version
```

**Expected output:**
```
openjdk 17.0.x
```

```bash
javac --version
```

**Expected output:**
```
javac 17.0.x
```

**Troubleshooting:** If command not found:
- Restart terminal/command prompt
- Restart computer
- Check JAVA_HOME environment variable

---

### Step 4: Install Git

**What it does:** Version control for your code

1. **Download Git**
   - Go to: https://git-scm.com
   - Download for your OS

2. **Install**
   - Windows: Run installer, use default settings
   - Mac: Use downloaded package
   - Linux: `sudo apt install git`

3. **Verify**

```bash
git --version
```

**Expected output:**
```
git version 2.43.0 (or similar)
```

4. **Configure Git** (First time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

### Step 5: Install VS Code (Recommended)

**What it does:** Code editor with great extensions

1. **Download VS Code**
   - Go to: https://code.visualstudio.com
   - Download for your OS

2. **Install Extensions**

After installing VS Code, install these extensions:

**Docker Extension:**
- Open VS Code
- Click Extensions icon (left sidebar)
- Search "Docker"
- Install "Docker" by Microsoft

**Java Extension Pack:**
- Search "Java Extension Pack"
- Install by Microsoft

**ES7+ React/Redux Snippets:**
- Search "ES7+ React"
- Install by dsznajder

**PostgreSQL:**
- Search "PostgreSQL"
- Install by Chris Kolkman

---

## 🌐 Creating Cloud Platform Accounts

### Step 1: Create GitHub Account

**Why:** Store your code and deploy from Git

1. Go to: https://github.com
2. Click "Sign up"
3. Enter email, password, username
4. Verify email
5. Choose free plan

**✅ Free plan is enough for this project**

---

### Step 2: Create Vercel Account

**Why:** Deploy React frontend (free hosting)

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access GitHub
5. Complete profile

**✅ Free tier includes:**
- Unlimited deployments
- Automatic HTTPS
- Custom domains
- Global CDN

---

### Step 3: Create Render.com Account

**Why:** Deploy Spring Boot backend (free tier available)

1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render
5. Complete profile

**✅ Free tier includes:**
- 750 hours/month (enough for learning)
- Automatic deploys from Git
- HTTPS included

**⚠️ Note:** Free tier sleeps after 15 min of inactivity (takes 30 seconds to wake up)

---

### Step 4: Create Neon Account

**Why:** PostgreSQL database hosting (generous free tier)

1. Go to: https://neon.tech
2. Click "Sign Up"
3. Sign up with GitHub
4. Complete registration

**✅ Free tier includes:**
- 10 projects
- 3GB storage per project
- Always-on databases
- Automatic backups

---

## ✅ Verification Checklist

Run all these commands to verify everything is installed:

```bash
# Docker
docker --version
docker-compose --version
docker run hello-world

# Node.js
node --version
npm --version

# Java
java --version
javac --version

# Git
git --version

# Check Git configuration
git config --global user.name
git config --global user.email
```

**✅ All commands should work without errors!**

---

## 🎓 Understanding What We Just Did

### Tools Summary

| Tool | Purpose | Why We Need It |
|------|---------|----------------|
| **Docker** | Run containers | Consistent environment everywhere |
| **Node.js** | JavaScript runtime | Build and run React app |
| **Java** | Java runtime | Build and run Spring Boot app |
| **Git** | Version control | Save code, deploy to cloud |
| **VS Code** | Code editor | Write code efficiently |

### Cloud Platforms Summary

| Platform | Hosts | Cost | Purpose |
|----------|-------|------|---------|
| **GitHub** | Code | Free | Store code, version control |
| **Vercel** | Frontend | Free | Deploy React app |
| **Render** | Backend | Free* | Deploy Spring Boot app |
| **Neon** | Database | Free | PostgreSQL hosting |

*Free tier with limitations, good for learning

---

## 🐳 Your First Docker Container

Let's run a simple web server in Docker to see how it works!

### Step 1: Run Nginx Web Server

```bash
docker run -d -p 8080:80 --name my-first-container nginx
```

**What this command does:**
- `docker run` - Create and start a container
- `-d` - Run in background (detached mode)
- `-p 8080:80` - Map port 8080 on your computer to port 80 in container
- `--name my-first-container` - Give it a friendly name
- `nginx` - Use nginx image (web server)

**Expected output:**
```
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
...
Status: Downloaded newer image for nginx:latest
abc123def456... (container ID)
```

### Step 2: Check Container is Running

```bash
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE   COMMAND                  STATUS         PORTS                  NAMES
abc123def456   nginx   "/docker-entrypoint.…"   Up 2 minutes   0.0.0.0:8080->80/tcp   my-first-container
```

### Step 3: Test the Web Server

Open web browser and go to: http://localhost:8080

**You should see:** Nginx welcome page!

```
Welcome to nginx!
If you see this page, the nginx web server is successfully installed and working.
```

**🎉 Congratulations! You just ran your first Docker container!**

### Step 4: View Container Logs

```bash
docker logs my-first-container
```

**Shows:** Web server access logs

### Step 5: Stop the Container

```bash
docker stop my-first-container
```

**Expected output:**
```
my-first-container
```

### Step 6: Remove the Container

```bash
docker rm my-first-container
```

**Expected output:**
```
my-first-container
```

### Step 7: Verify Container is Gone

```bash
docker ps -a
```

**Expected output:** Empty list (or no my-first-container)

---

## 🎯 Understanding What Just Happened

### The Docker Workflow You Just Learned

1. **Pull Image** - Docker downloaded nginx image from Docker Hub
2. **Create Container** - Docker created container from image
3. **Start Container** - Container started running nginx
4. **Access Service** - You accessed nginx through browser
5. **Stop Container** - Container stopped running
6. **Remove Container** - Container deleted

### This is the basic Docker cycle we'll use for our app!

---

## 📖 Docker Commands Cheat Sheet

### Container Management
```bash
# Run container
docker run [image]

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop container
docker stop [container-name]

# Start stopped container
docker start [container-name]

# Remove container
docker rm [container-name]

# View container logs
docker logs [container-name]

# Execute command in running container
docker exec -it [container-name] bash
```

### Image Management
```bash
# List images
docker images

# Pull image from Docker Hub
docker pull [image-name]

# Build image from Dockerfile
docker build -t [image-name] .

# Remove image
docker rmi [image-name]
```

### Cleanup
```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove everything (use carefully!)
docker system prune -a
```

---

## 🎓 Key Concepts Review

### What is an Image?
A blueprint/template with all code and dependencies

### What is a Container?
A running instance of an image

### What is a Dockerfile?
Instructions to build an image

### What is Docker Compose?
Tool to run multiple containers together

---

## ✅ Pre-Development Checklist

Before moving to Part 2, ensure:

- [ ] Docker Desktop installed and running
- [ ] Node.js 18+ installed
- [ ] Java 17+ installed
- [ ] Git installed and configured
- [ ] VS Code installed with extensions
- [ ] GitHub account created
- [ ] Vercel account created
- [ ] Render.com account created
- [ ] Neon account created
- [ ] Successfully ran `docker run hello-world`
- [ ] Successfully ran nginx container example
- [ ] Understand basic Docker concepts

---

## 🚀 What's Next?

**Part 2: Project Setup & Folder Structure**

In the next part, you'll:
- Create project folder structure
- Initialize React frontend
- Initialize Spring Boot backend
- Create your first Dockerfiles
- Understand Docker best practices

**Time:** 30 minutes  
**Difficulty:** Easy

---

## 💡 Tips for Success

### Do's ✅
- Take notes as you learn
- Type commands yourself (don't just copy-paste)
- Read error messages carefully
- Test after each major step
- Ask questions if confused

### Don'ts ❌
- Don't skip steps
- Don't rush through explanations
- Don't ignore errors
- Don't be afraid to experiment
- Don't give up if something doesn't work first time

---

## 🆘 Troubleshooting Common Issues

### Docker Desktop won't start

**Windows:**
- Enable virtualization in BIOS
- Enable WSL 2
- Run as Administrator

**Mac:**
- Grant system permissions
- Check for macOS updates

**Linux:**
- Check Docker daemon: `sudo systemctl status docker`
- Ensure user is in docker group

### "docker: command not found"

**Solution:**
- Restart terminal
- Restart computer
- Reinstall Docker Desktop
- Check PATH environment variable

### Nginx example doesn't work

**Solution:**
- Check port 8080 not already in use
- Try different port: `docker run -p 8081:80 nginx`
- Check Docker Desktop is running
- Check firewall settings

---

## 📚 Additional Learning Resources

### Docker
- Official Tutorial: https://docs.docker.com/get-started/
- Docker Curriculum: https://docker-curriculum.com
- Play with Docker: https://labs.play-with-docker.com

### General
- GitHub Learning Lab: https://lab.github.com
- freeCodeCamp: https://freecodecamp.org

---

**✅ Part 1 Complete!**

You now understand:
- What Docker is and why we use it
- Difference between containers and VMs
- Basic Docker commands
- Your development environment is ready

**Next:** [Part 2 - Project Setup & Folder Structure](./DOCKER_FULLSTACK_PART_2_SETUP.md)

---

*Remember: Learning Docker is like learning to ride a bike. It might seem complex at first, but once you get it, you'll wonder how you lived without it!* 🚴‍♂️

