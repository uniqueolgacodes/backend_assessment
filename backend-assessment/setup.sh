#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# Backend Assessment - Automated Setup Script
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║   █████╗ ███████╗███████╗███████╗███████╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗   ║"
echo "║  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝   ║"
echo "║  ███████║███████╗███████╗█████╗  █████╗  █████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║      ║"
echo "║  ██╔══██║╚════██║╚════██║██╔══╝  ██╔══╝  ██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║      ║"
echo "║  ██║  ██║███████║███████║██║     ██║     ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║      ║"
echo "║  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝     ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝      ║"
echo "║                                                                               ║"
echo "║                    Backend Engineer Technical Assessment                      ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}🔧 Setting up your development environment...${NC}\n"

# Function to print step info
print_step() {
    echo -e "${YELLOW}📋 Step $1: $2${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
check_docker() {
    print_step "1" "Checking Docker installation"
    if command -v docker &> /dev/null; then
        print_success "Docker is installed ($(docker --version))"
    else
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_step "2" "Checking Node.js installation"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed ($NODE_VERSION)"
        
        # Check if version is 18 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    if command -v npm &> /dev/null; then
        print_success "npm is installed ($(npm --version))"
    else
        print_error "npm is not installed"
        exit 1
    fi
}

# Start PostgreSQL container
start_database() {
    print_step "3" "Starting PostgreSQL container"
    
    if docker ps | grep -q assessment-postgres; then
        print_info "PostgreSQL container is already running"
    else
        docker-compose up -d postgres
        print_success "PostgreSQL container started"
        
        # Wait for PostgreSQL to be ready
        print_info "Waiting for PostgreSQL to be ready..."
        sleep 5
        
        until docker exec assessment-postgres pg_isready -U assessment -d assessment_db > /dev/null 2>&1; do
            echo -n "."
            sleep 2
        done
        echo ""
        print_success "PostgreSQL is ready!"
    fi
}

# Install dependencies
install_dependencies() {
    print_step "4" "Installing dependencies"
    
    # Root dependencies
    print_info "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
    
    # Security package
    print_info "Installing security package dependencies..."
    cd packages/security
    npm install
    cd ../..
    print_success "Security package dependencies installed"
    
    # Proto package
    print_info "Installing proto package dependencies..."
    cd packages/proto
    npm install
    cd ../..
    print_success "Proto package dependencies installed"
    
    # Prisma package
    print_info "Installing prisma package dependencies..."
    cd packages/prisma
    npm install
    cd ../..
    print_success "Prisma package dependencies installed"
    
    # User service
    print_info "Installing user-service dependencies..."
    cd apps/user-service
    npm install
    cd ../..
    print_success "User service dependencies installed"
    
    # Wallet service
    print_info "Installing wallet-service dependencies..."
    cd apps/wallet-service
    npm install
    cd ../..
    print_success "Wallet service dependencies installed"
}

# Setup environment file
setup_env() {
    print_step "5" "Setting up environment configuration"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
    else
        print_info ".env file already exists"
    fi
}

# Run Prisma migrations
run_migrations() {
    print_step "6" "Running database migrations"
    
    cd packages/prisma
    npx prisma migrate dev --name init
    cd ../..
    print_success "Database migrations completed"
}

# Generate Prisma client
generate_prisma() {
    print_step "7" "Generating Prisma client"
    
    cd packages/prisma
    npx prisma generate
    cd ../..
    print_success "Prisma client generated"
}

# Build packages
build_packages() {
    print_step "8" "Building shared packages"
    
    # Build security package
    print_info "Building security package..."
    cd packages/security
    npm run build
    cd ../..
    print_success "Security package built"
    
    # Build proto package
    print_info "Building proto package..."
    cd packages/proto
    npm run build 2>/dev/null || print_info "Proto build skipped (run manually after proto compilation)"
    cd ../..
}

# Print final instructions
print_instructions() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                        🎉 Setup Complete! 🎉                                  ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}📚 Next Steps:${NC}"
    echo ""
    echo -e "${YELLOW}1. Start the User Service:${NC}"
    echo -e "   ${BLUE}cd apps/user-service && npm run start:dev${NC}"
    echo ""
    echo -e "${YELLOW}2. In a new terminal, start the Wallet Service:${NC}"
    echo -e "   ${BLUE}cd apps/wallet-service && npm run start:dev${NC}"
    echo ""
    echo -e "${YELLOW}3. Test the services:${NC}"
    echo -e "   ${BLUE}node examples/test-client.js${NC}"
    echo ""
    echo -e "${CYAN}📖 Documentation:${NC}"
    echo -e "   • ${BLUE}README.md${NC} - Project overview"
    echo -e "   • ${BLUE}SETUP_GUIDE.md${NC} - Detailed setup instructions"
    echo -e "   • ${BLUE}ARCHITECTURE.md${NC} - Code architecture and patterns"
    echo -e "   • ${BLUE}SECURITY_README.md${NC} - IP protection information"
    echo ""
    echo -e "${CYAN}🔐 Security Notice:${NC}"
    echo -e "   This software is in ${YELLOW}INTERVIEW MODE${NC} with a ${YELLOW}7-day trial period${NC}."
    echo -e "   See ${BLUE}SECURITY_README.md${NC} for more information."
    echo ""
}

# Main execution
main() {
    echo -e "${CYAN}Starting automated setup...${NC}\n"
    
    check_docker
    check_node
    start_database
    install_dependencies
    setup_env
    run_migrations
    generate_prisma
    build_packages
    
    print_instructions
}

# Run main function
main
