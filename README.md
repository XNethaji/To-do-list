# ✨ Productivity Reminder - Todo App  

A modern, feature-rich task management application with a beautiful UI and robust backend.


## 🌟 Features

### Authentication & User Management
- 🔐 Secure user authentication
- 👤 Personal user profiles
- 📱 Mobile number verification
- 🔑 Password encryption


### Task Management
- ✅ Create, edit, and delete tasks
- 📅 Due date tracking
- ⭐ Mark tasks as important
- 🏷️ Categorize tasks
- 🔍 Search functionality
- 📊 Progress tracking

### User Interface
- 🌓 Dark/Light mode toggle
- 📱 Responsive design
- 🎯 Clean and intuitive interface
- ⚡ Real-time updates


## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Modern web browser

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/productivity-reminder.git
cd productivity-reminder
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
mysql -u root -p < setup-database.sql
```

4. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Start the application
```bash
npm start
```

## 💻 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **UI Framework**: Custom CSS with Flexbox/Grid

## 📱 Screenshots

### Sign In Interface
![Sign up](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042117.png)

### Sign up Interface
The sign-up page allows new users to register by entering their details such as username, email, and password.  

![Sign up](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042159.png)

### Login successful 
Once users enter their correct credentials, they are redirected to the homepage after successful authentication.

![Login successful](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042219.png)

### HOMEPAGE
This is the main dashboard where users can view their tasks. The light theme offers a bright and clean interface for better readability. 

![HOMEPAGE in light theme](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042404.png)

### HOMEPAGE
For users who prefer a darker UI, the application provides a dark mode, reducing strain on the eyes and improving aesthetics.  

![HOMEPAGE in dark theme](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042421.png)

### NEW TASK
Users can add new tasks by entering a task name and optional description. Clicking the "Add Task" button saves the task to the database.  

![Add a new task](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042537.png)

### TASK ADDED
After adding a task, it appears in the task list with options to mark it as completed, edit, or delete.  

![New task added](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042553.png)

### EDIT AND DELETE 
Users can edit existing tasks to update their content or delete them when they are no longer needed.  

![](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042421.png)


## 🔒 Security Features

- Password hashing using bcrypt
- JWT for secure authentication
- Protected API endpoints
- Input validation and sanitization
- CORS protection

## 📊 Database Schema

The application uses a MySQL database with the following main tables:

- `users`: Store user information and credentials
- `tasks`: Store task data with user relationships

![Database Structure](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-13%20042828-ay0irBdMeOPMR0MBgyvXpG7ycLBY9d.png)




## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide Icons](https://lucide.dev)
- Color palette inspiration from [CSS](https://tailwindcss.com)
- UI/UX best practices from [Material Design](https://material.io)

---

Made with   [NETHAJI K]
