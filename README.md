# S3 File Storage

A secure cloud-based file storage application using AWS S3 for backend storage. This application allows users to upload, preview, download, and manage files through a clean and responsive web interface.

## Features

- **File Upload**: Drag and drop interface for easy file uploads
- **File Preview**: Built-in preview for images, PDFs, and text files
- **File Management**: List, download, and delete your files
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Progress indicators and toast notifications
- **Containerized**: Docker setup for easy deployment

## Tech Stack

### Frontend

- React
- Axios for API requests
- react-dropzone for file uploads
- react-toastify for notifications
- CSS for styling

### Backend

- Node.js
- Express.js
- AWS SDK for S3 integration
- Multer for file handling

### DevOps

- Docker & Docker Compose
- Nginx for serving frontend and API proxying

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose (for containerized setup)
- AWS account with S3 bucket

### Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/s3-file-storage.git
   cd s3-file-storage
   ```
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Configure environment variables:

   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update with your AWS credentials and S3 bucket name
4. Start the development servers:

   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend development server (from frontend directory)
   npm start
   ```

### Docker Setup

1. Configure environment variables in the root `.env` file:

   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   S3_BUCKET=your_bucket_name
   expiresIn=3600
   ```
2. Build and start the containers:

   ```bash
   docker-compose up -d
   ```
3. Access the application at http://localhost

## Environment Variables

### Backend

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_REGION`: AWS region where your S3 bucket is located
- `S3_BUCKET`: Name of your S3 bucket
- `PORT`: Port for the backend server (default: 3001)
- `expiresIn`: Expiration time for signed URLs in seconds (default: 3600)

### Frontend

- `REACT_APP_API_URL`: URL for the backend API

## API Endpoints

| Endpoint       | Method | Description                          |
| -------------- | ------ | ------------------------------------ |
| `/upload`    | POST   | Upload a file to S3                  |
| `/`          | GET    | List all files in the bucket         |
| `/:fileName` | GET    | Get a signed URL for a specific file |
| `/:fileName` | DELETE | Delete a specific file from S3       |

## How It Works

1. **Upload Process**:

   - Files are uploaded to the Node.js server
   - Server uses AWS SDK to store files in S3
   - Unique filenames are generated to prevent conflicts
2. **File Viewing**:

   - Signed URLs are generated for secure, time-limited access
   - Built-in preview for supported file types
   - Direct download links available for all files
3. **Storage System**:

   - Files are stored in AWS S3 for durability and scalability
   - Metadata is maintained for content type, size, and upload date

## Security Considerations

- Use environment variables for sensitive credentials
- Signed URLs with expiration for secure file access
- Implement proper IAM policies for your AWS account (not covered in this repo)
- Consider adding authentication to protect files (not implemented in this demo)

## Disclaimer

This project is for demonstration purposes. In a production environment, you should:

- Never commit AWS credentials to version control
- Implement proper authentication and authorization
- Set up proper CORS policies
- Configure proper IAM roles and policies
