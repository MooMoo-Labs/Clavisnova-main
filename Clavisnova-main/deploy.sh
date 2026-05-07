#!/bin/bash

# Clavisnova Docker Deployment Script
# This script helps you deploy the Clavisnova application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}     Clavisnova Docker Deployment${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from example..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Please edit .env file with your configuration before proceeding!"
            print_info "Required settings:"
            print_info "  - SECRET_KEY: Generate a secure key"
            print_info "  - DATABASE_URL: Your Supabase PostgreSQL URL"
            print_info "  - FRONTEND_URL: Your Cloudflare Pages URL"
            read -p "Press Enter to continue after editing .env..."
        else
            print_error "env.example file not found. Please create your .env file manually."
            exit 1
        fi
    else
        print_success ".env file exists"
    fi

    # Validate required environment variables
    if ! grep -q "^DATABASE_URL=" .env 2>/dev/null; then
        print_error "DATABASE_URL not found in .env file. Please add your Supabase database URL."
        exit 1
    fi

    if ! grep -q "^FRONTEND_URL=" .env 2>/dev/null; then
        print_warning "FRONTEND_URL not found in .env file. Frontend redirects may not work properly."
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    mkdir -p data logs
    print_success "Directories created"
}

# Build and start the application
deploy() {
    print_info "Building and starting Clavisnova application..."

    # Stop any existing containers
    print_info "Stopping existing containers..."
    docker-compose down || true

    # Build the image
    print_info "Building Docker image..."
    docker-compose build

    # Start the application
    print_info "Starting application..."
    docker-compose up -d

    # Wait for health check
    print_info "Waiting for application to be healthy..."
    sleep 10

    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        print_success "Application deployed successfully!"
        print_info "Application is running at: http://localhost:8080"
        print_info "Admin panel: http://localhost:8080/admin.html"
        print_info "Health check: http://localhost:8080/api/health"
    else
        print_error "Failed to start application. Check logs:"
        docker-compose logs
        exit 1
    fi
}

# View logs
view_logs() {
    print_info "Viewing application logs..."
    docker-compose logs -f
}

# Stop application
stop_app() {
    print_info "Stopping application..."
    docker-compose down
    print_success "Application stopped"
}

# Restart application
restart_app() {
    print_info "Restarting application..."
    docker-compose restart
    print_success "Application restarted"
}

# Clean up
cleanup() {
    print_info "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Main menu
show_menu() {
    echo
    echo -e "${BLUE}Available options:${NC}"
    echo "1) Deploy application"
    echo "2) View logs"
    echo "3) Stop application"
    echo "4) Restart application"
    echo "5) Cleanup Docker resources"
    echo "6) Exit"
    echo
}

# Main script
main() {
    print_header

    # Check prerequisites
    check_docker
    check_env
    create_directories

    while true; do
        show_menu
        read -p "Choose an option (1-6): " choice

        case $choice in
            1)
                deploy
                ;;
            2)
                view_logs
                ;;
            3)
                stop_app
                ;;
            4)
                restart_app
                ;;
            5)
                cleanup
                ;;
            6)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-6."
                ;;
        esac

        echo
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"
